import { readConfObject } from '@gmod/jbrowse-core/configuration'
import '@gmod/jbrowse-core/fonts/material-icons.css'
import { App, theme, FatalErrorDialog } from '@gmod/jbrowse-core/ui'
import {
  useDebounce,
  inDevelopment,
  mergeConfigs,
} from '@gmod/jbrowse-core/util'
import ErrorBoundary from 'react-error-boundary'

import { openLocation } from '@gmod/jbrowse-core/util/io'

// material-ui
import CircularProgress from '@material-ui/core/CircularProgress'
import CssBaseline from '@material-ui/core/CssBaseline'
import { ThemeProvider } from '@material-ui/styles'

import { observer } from 'mobx-react'
import { onSnapshot } from 'mobx-state-tree'
import { UndoManager } from 'mst-middlewares'
import React, { useEffect, useState } from 'react'
import 'typeface-roboto'

import JBrowseRootModel from './rootModel'

async function parseConfig(configLoc) {
  const config = JSON.parse(await openLocation(configLoc).readFile('utf8'))
  if (inDevelopment) {
    config.datasets = mergeConfigs(
      config,
      JSON.parse(
        await openLocation({ uri: 'test_data/config_in_dev.json' }).readFile(
          'utf8',
        ),
      ),
    )
  }
  return config
}

function useJBrowseWeb(config, initialState) {
  const [loaded, setLoaded] = useState(false)
  const [rootModel, setRootModel] = useState(initialState || {})

  const [sessionSnapshot, setSessionSnapshot] = useState()
  const debouncedSessionSnapshot = useDebounce(sessionSnapshot, 400)
  const [configSnapshot, setConfigSnapshot] = useState(config || {})

  const { session, jbrowse } = rootModel || {}
  const useLocalStorage = jbrowse
    ? readConfObject(jbrowse.configuration, 'useLocalStorage')
    : false

  // This updates savedSession list on the rootModel
  useEffect(() => {
    if (rootModel && rootModel.session && debouncedSessionSnapshot) {
      rootModel.jbrowse.updateSavedSession(debouncedSessionSnapshot)
    }
  }, [debouncedSessionSnapshot, rootModel])

  useEffect(() => {
    try {
      setRootModel(JBrowseRootModel.create({ jbrowse: configSnapshot }))
    } catch (error) {
      // if it failed to load, it's probably a problem with the saved sessions,
      // so just delete them and try again
      setRootModel(
        JBrowseRootModel.create({
          jbrowse: { ...configSnapshot, savedSessions: [] },
        }),
      )
    }
  }, [configSnapshot])

  // This loads a config from localStorage or a configSnapshot or a config.json file
  useEffect(() => {
    ;(async () => {
      try {
        if (initialState) {
          setRootModel(initialState)
        } else {
          const localStorageConfig =
            useLocalStorage && localStorage.getItem('jbrowse-web-data')

          if (localStorageConfig) {
            setConfigSnapshot(JSON.parse(localStorageConfig))
          }
          if (configSnapshot.uri || configSnapshot.localPath) {
            setConfigSnapshot(await parseConfig(config))
          }
        }
      } catch (e) {
        setLoaded(() => {
          // throw to error boundary
          throw e
        })
      }
    })()
  }, [
    config,
    configSnapshot.localPath,
    configSnapshot.uri,
    initialState,
    useLocalStorage,
  ])

  // finalize rootModel and setLoaded
  useEffect(() => {
    if (rootModel && rootModel.jbrowse) {
      const localStorageSession = localStorage.getItem('jbrowse-web-session')
      if (localStorageSession) {
        rootModel.setSession(JSON.parse(localStorageSession))
      }
      if (!rootModel.session) {
        if (rootModel.jbrowse && rootModel.jbrowse.savedSessions.length) {
          const { name } = rootModel.jbrowse.savedSessions[0]
          rootModel.activateSession(name)
        } else {
          rootModel.setDefaultSession()
        }
      }

      rootModel.setHistory(
        UndoManager.create({}, { targetStore: rootModel.session }),
      )
      setLoaded(true)
    }
  }, [rootModel])

  // make some things available globally for testing
  // e.g. window.MODEL.views[0] in devtools
  useEffect(() => {
    if (loaded) {
      window.MODEL = rootModel.session
      window.ROOTMODEL = rootModel
    }
  }, [loaded, rootModel, rootModel.session])

  // set session in localstorage
  useEffect(
    () =>
      useLocalStorage && loaded
        ? onSnapshot(rootModel.session, snapshot => {
            localStorage.setItem(
              'jbrowse-web-session',
              JSON.stringify(snapshot),
            )
          })
        : () => {},
    [loaded, rootModel, useLocalStorage],
  )

  // save jbrowse-web data in localstorage when the session is snapshotted
  useEffect(
    () =>
      useLocalStorage && loaded
        ? onSnapshot(rootModel.jbrowse, snapshot => {
            localStorage.setItem('jbrowse-web-data', JSON.stringify(snapshot))
          })
        : () => {},
    [loaded, rootModel, useLocalStorage],
  )

  // listen to the session for snapshots
  useEffect(
    () =>
      session
        ? onSnapshot(session, snapshot => {
            setSessionSnapshot(snapshot)
          })
        : () => {},
    [session],
  )

  return [loaded, rootModel]
}

const JBrowse = observer(({ config, initialState }) => {
  const [loaded, root] = useJBrowseWeb(config, initialState)
  const debouncedLoaded = useDebounce(loaded, 400)
  // Use a debounce loaded here to let the circle spinner give a tiny more turn
  // which looks better
  return !debouncedLoaded ? (
    <CircularProgress
      style={{
        position: 'fixed',
        top: '50%',
        left: '50%',
        marginTop: -25,
        marginLeft: -25,
      }}
      size={50}
    />
  ) : (
    <App session={root.session} />
  )
})

export default props => {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <ErrorBoundary FallbackComponent={FatalErrorDialog}>
        <JBrowse {...props} />
      </ErrorBoundary>
    </ThemeProvider>
  )
}
