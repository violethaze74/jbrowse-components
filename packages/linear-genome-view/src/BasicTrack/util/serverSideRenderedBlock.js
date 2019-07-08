import { types, getParent, isAlive, addDisposer } from 'mobx-state-tree'

import { reaction } from 'mobx'
import { getConf, readConfObject } from '@gmod/jbrowse-core/configuration'

import { Region } from '@gmod/jbrowse-core/mst-types'

import {
  assembleLocString,
  checkAbortSignal,
  isAbortException,
} from '@gmod/jbrowse-core/util'
import {
  getContainingAssembly,
  getContainingView,
} from '@gmod/jbrowse-core/util/tracks'

function getRendererType(view, session, rendererTypeName) {
  const RendererType = session.pluginManager.getRendererType(rendererTypeName)
  if (!RendererType)
    throw new Error(`renderer "${view.rendererTypeName}" not found`)
  if (!RendererType.ReactComponent)
    throw new Error(
      `renderer ${rendererTypeName} has no ReactComponent, it may not be completely implemented yet`,
    )
  return RendererType
}

function getAdapterType(adapterConfig, session, track) {
  if (!adapterConfig)
    throw new Error(`no adapter configuration provided for ${track.type}`)
  const adapterType = session.pluginManager.getAdapterType(adapterConfig.type)
  if (!adapterType)
    throw new Error(`unknown adapter type ${adapterConfig.type}`)
  return adapterType
}

function makeRenderArgs(track, region, session) {
  const assemblyName = readConfObject(
    getContainingAssembly(track.configuration),
    'assemblyName',
  )
  const adapterConfig = getConf(track, 'adapter')
  const adapterType = getAdapterType(adapterConfig, session, track).name
  const renderProps = { ...track.renderProps }
  return {
    assemblyName,
    region,
    adapterType,
    adapterConfig,
    rendererType: track.rendererTypeName,
    renderProps,
    sessionId: track.id,
    timeout: 1000000, // 10000,
  }
}

// calls the render worker to render the block content
// not using a flow for this, because the flow doesn't
// work with autorun
function renderBlockData(self, session) {
  if (!session) console.error(session)
  const track = getParent(self, 2)
  const view = getContainingView(track)
  const { rpcManager, assemblyManager } = session
  const trackConf = track.configuration
  let trackConfParent = getParent(trackConf)
  if (!trackConfParent.assemblyName)
    trackConfParent = getParent(trackConfParent)
  const trackAssemblyName = readConfObject(trackConfParent, 'assemblyName')
  const trackAssemblyData =
    assemblyManager.assemblyData.get(trackAssemblyName) || {}
  const trackAssemblyAliases = trackAssemblyData.aliases || []
  let cannotBeRenderedReason
  if (
    !(
      trackAssemblyName === self.region.assemblyName ||
      trackAssemblyAliases.includes(self.region.assemblyName)
    )
  )
    cannotBeRenderedReason = 'region assembly does not match track assembly'
  else cannotBeRenderedReason = track.regionCannotBeRendered(self.region)
  const renderProps = { ...track.renderProps }
  const rendererType = getRendererType(view, session, track.rendererTypeName)
  return {
    rendererType,
    rpcManager,
    renderProps,
    cannotBeRenderedReason,
    trackError: track.error,
    renderArgs: makeRenderArgs(track, self.region, session),
  }
}

async function renderBlockEffect(self, props, allowRefetch = true) {
  const {
    trackError,
    rendererType,
    renderProps,
    rpcManager,
    cannotBeRenderedReason,
    renderArgs,
  } = props
  // console.log(getContainingView(self).rendererType)
  if (!isAlive(self)) return

  if (trackError) {
    self.setError(trackError)
    return
  }
  if (cannotBeRenderedReason) {
    self.setMessage(cannotBeRenderedReason)
    return
  }

  const aborter = new AbortController()
  self.setLoading(aborter)
  if (renderProps.notReady) return

  try {
    renderArgs.signal = aborter.signal
    // const callId = [
    //   assembleLocString(renderArgs.region),
    //   renderArgs.rendererType,
    // ]
    const { html, ...data } = await rendererType.renderInClient(
      rpcManager,
      renderArgs,
    )
    // if (aborter.signal.aborted) {
    //   console.log(...callId, 'request to abort render was ignored', html, data)
    // }
    checkAbortSignal(aborter.signal)
    self.setRendered(data, html, rendererType.ReactComponent, renderProps)
  } catch (error) {
    if (!isAbortException(error)) console.error(error)
    if (isAbortException(error) && !aborter.signal.aborted) {
      // there is a bug in the underlying code and something is caching aborts. try to refetch once
      const track = getParent(self, 2)
      if (allowRefetch) {
        console.warn(`cached abort detected, refetching "${track.name}"`)
        renderBlockEffect(self, props, false)
        return
      }
      console.warn(`cached abort detected, failed to recover "${track.name}"`)
    }
    if (isAlive(self) && !isAbortException(error)) {
      // setting the aborted exception as an error will draw the "aborted" error, and we
      // have not found how to create a re-render if this occurs
      self.setError(error)
    }
  }
}

// the MST state of a single server-side-rendered block in a track
export default types
  .model('BlockState', {
    key: types.string,
    region: Region,
    isLeftEndOfDisplayedRegion: false,
    isRightEndOfDisplayedRegion: false,
  })
  // NOTE: all this volatile stuff has to be filled in at once, so that it stays consistent
  .volatile(() => ({
    filled: false,
    data: undefined,
    html: '',
    error: undefined,
    RenderingComponent: undefined,
    renderProps: undefined,
    renderInProgress: undefined,
    session: undefined,
  }))
  .actions(self => ({
    start(session) {
      self.setSession(session)
      const track = getParent(self, 2)
      const renderDisposer = reaction(
        () => renderBlockData(self, session),
        data => renderBlockEffect(self, data),
        {
          name: `${track.id}/${assembleLocString(self.region)} rendering`,
          delay: track.renderDelay,
          fireImmediately: true,
        },
      )
      addDisposer(self, renderDisposer)
    },
    setSession(session) {
      self.session = session
    },
    setLoading(abortController) {
      if (self.renderInProgress && !self.renderInProgress.signal.aborted) {
        self.renderInProgress.abort()
      }
      self.filled = false
      self.message = undefined
      self.html = ''
      self.data = undefined
      self.error = undefined
      self.RenderingComponent = undefined
      self.renderProps = undefined
      self.renderInProgress = abortController
    },
    setMessage(messageText) {
      if (self.renderInProgress && !self.renderInProgress.signal.aborted) {
        self.renderInProgress.abort()
      }
      self.filled = false
      self.message = messageText
      self.html = ''
      self.data = undefined
      self.error = undefined
      self.RenderingComponent = undefined
      self.renderProps = undefined
      self.renderInProgress = undefined
    },
    setRendered(data, html, RenderingComponent, renderProps) {
      self.filled = true
      self.message = undefined
      self.html = html
      self.data = data
      self.error = undefined
      self.RenderingComponent = RenderingComponent
      self.renderProps = renderProps
      self.renderInProgress = undefined
    },
    setError(error) {
      if (self.renderInProgress && !self.renderInProgress.signal.aborted) {
        self.renderInProgress.abort()
      }
      // the rendering failed for some reason
      self.filled = false
      self.message = undefined
      self.html = undefined
      self.data = undefined
      self.error = error
      self.RenderingComponent = undefined
      self.renderProps = undefined
      self.renderInProgress = undefined
    },
    beforeDestroy() {
      if (self.renderInProgress && !self.renderInProgress.signal.aborted) {
        self.renderInProgress.abort()
      }
      if (self.session) {
        const track = getParent(self, 2)
        const view = getContainingView(track)
        const rendererType = getRendererType(
          view,
          self.session,
          track.rendererTypeName,
        )
        const { rpcManager } = self.session
        const renderArgs = makeRenderArgs(track, self.region, self.session)
        rendererType.freeResourcesInClient(
          rpcManager,
          JSON.parse(JSON.stringify(renderArgs)),
        )
      }
    },
  }))
