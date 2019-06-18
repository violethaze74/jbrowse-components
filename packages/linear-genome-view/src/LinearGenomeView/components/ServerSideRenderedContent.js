import React, { useEffect, useRef, useState } from 'react'
import { observer, PropTypes } from 'mobx-react'
import { hydrate, unmountComponentAtNode } from 'react-dom'
import { isAlive, isStateTreeNode, getSnapshot } from 'mobx-state-tree'

import { requestIdleCallback } from 'request-idle-callback'

/**
 * A block whose content is rendered outside of the main thread and hydrated by this
 * component.
 */
function ServerSideRenderedContent(props) {
  const ssrContainerNode = useRef()
  const [hydrated, setHydrated] = useState(false)

  const { model, session } = props
  const { data, region, html, renderProps, RenderingComponent } = model

  useEffect(() => {
    let domNode

    function doHydrate() {
      domNode = ssrContainerNode.current
      if (domNode && model.filled) {
        if (hydrated) unmountComponentAtNode(domNode.firstChild)
        domNode.innerHTML = `<div className="ssr-container-inner"></div>`
        domNode.firstChild.innerHTML = html
        // defer main-thread rendering and hydration for when
        // we have some free time. helps keep the framerate up.
        requestIdleCallback(() => {
          if (!isAlive(model) || !isAlive(region)) return
          const serializedRegion = isStateTreeNode(region)
            ? getSnapshot(region)
            : region
          const mainThreadRendering = (
            <RenderingComponent
              {...data}
              region={serializedRegion}
              session={session}
              {...renderProps}
            />
          )
          requestIdleCallback(() => {
            if (!isAlive(model) || !isAlive(region)) return
            hydrate(mainThreadRendering, domNode.firstChild)
            setHydrated(true)
          })
        })
      }
    }

    doHydrate()

    return () => {
      if (domNode && hydrated) unmountComponentAtNode(domNode.firstChild)
    }
  })

  return (
    <div
      ref={ssrContainerNode}
      data-html-size={model.html.length}
      className="ssr-container"
    />
  )
}

ServerSideRenderedContent.propTypes = {
  model: PropTypes.observableObject.isRequired,
}

export default observer(ServerSideRenderedContent)
