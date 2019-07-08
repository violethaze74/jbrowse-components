import { PropTypes as CommonPropTypes } from '@gmod/jbrowse-core/mst-types'
import { observer, PropTypes as MobxPropTypes } from 'mobx-react'
import ReactPropTypes from 'prop-types'
import React, { useState } from 'react'
import Box from './Box'
import './SvgFeatureRendering.scss'

function SvgFeatureRendering(props) {
  const [mouseIsDown, setMouseIsDown] = useState(false)
  const [movedDuringLastMouseDown, setMovedDuringLastMouseDown] = useState(
    false,
  )

  const {
    region,
    bpPerPx,
    layout,
    horizontallyFlipped,
    config,
    features,
    targetType,
    session,
  } = props

  function onMouseDown(event) {
    setMouseIsDown(true)
    setMovedDuringLastMouseDown(false)
    const { onMouseDown: handler } = props
    if (!handler) return undefined
    return handler(event)
  }

  function onMouseUp(event) {
    setMouseIsDown(false)
    const { onMouseUp: handler } = props
    if (!handler) return undefined
    return handler(event)
  }

  function onMouseEnter(event) {
    const { onMouseEnter: handler } = props
    if (!handler) return undefined
    return handler(event)
  }

  function onMouseLeave(event) {
    const { onMouseLeave: handler } = props
    if (!handler) return undefined
    return handler(event)
  }

  function onMouseOver(event) {
    const { onMouseOver: handler } = props
    if (!handler) return undefined
    return handler(event)
  }

  function onMouseOut(event) {
    const { onMouseOut: handler } = props
    if (!handler) return undefined
    return handler(event)
  }

  function onMouseMove() {
    if (mouseIsDown) setMovedDuringLastMouseDown(true)
  }

  function onClick(event) {
    if (!movedDuringLastMouseDown) {
      const { onClick: handler } = props
      session.event(event, undefined, targetType)
      if (!handler) return undefined
      return handler(event)
    }
    return undefined
  }

  function chooseGlyphComponent(/* feature */) {
    return Box
  }

  // is the globally-selected thing probably a feature?
  let selectedFeatureId
  if (session) {
    const { selection } = session
    // does it quack like a feature?
    if (
      selection &&
      typeof selection.get === 'function' &&
      typeof selection.id === 'function'
    )
      // probably is a feature
      selectedFeatureId = selection.id()
  }

  let hoveredFeatureId
  if (session) {
    const { hover } = session
    // does it quack like a feature?
    if (
      hover &&
      typeof hover.get === 'function' &&
      typeof hover.id === 'function'
    )
      // probably is a feature
      hoveredFeatureId = hover.id()
  }

  const featuresRendered = []
  for (const feature of features.values()) {
    try {
      const FeatureComponent = chooseGlyphComponent(feature)
      const layoutRecord = FeatureComponent.layout({
        feature,
        horizontallyFlipped,
        bpPerPx,
        region,
        config,
        layout,
      })
      featuresRendered.push(
        <FeatureComponent
          {...props}
          layoutRecord={layoutRecord}
          feature={feature}
          key={feature.id()}
          selectedFeatureId={selectedFeatureId}
          hoveredFeatureId={hoveredFeatureId}
          session={session}
        />,
      )
    } catch (e) {
      console.error(e)
    }
  }

  const width = (region.end - region.start) / bpPerPx
  const height = layout.getTotalHeight()

  return (
    <svg
      className="SvgFeatureRendering"
      width={`${width}px`}
      height={`${height}px`}
      style={{
        position: 'relative',
      }}
      onMouseDown={onMouseDown}
      onMouseUp={onMouseUp}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      onMouseOver={onMouseOver}
      onMouseOut={onMouseOut}
      onFocus={onMouseEnter}
      onBlur={onMouseLeave}
      onMouseMove={onMouseMove}
      onClick={onClick}
    >
      {featuresRendered}
    </svg>
  )
}

SvgFeatureRendering.propTypes = {
  layout: ReactPropTypes.shape({
    addRect: ReactPropTypes.func.isRequired,
    getTotalHeight: ReactPropTypes.func.isRequired,
  }).isRequired,

  region: CommonPropTypes.Region.isRequired,
  bpPerPx: ReactPropTypes.number.isRequired,
  horizontallyFlipped: ReactPropTypes.bool,
  features: ReactPropTypes.instanceOf(Map),
  config: CommonPropTypes.ConfigSchema.isRequired,
  targetType: ReactPropTypes.string,
  session: MobxPropTypes.objectOrObservableObject,

  onMouseDown: ReactPropTypes.func,
  onMouseUp: ReactPropTypes.func,
  onMouseEnter: ReactPropTypes.func,
  onMouseLeave: ReactPropTypes.func,
  onMouseOver: ReactPropTypes.func,
  onMouseOut: ReactPropTypes.func,
  onClick: ReactPropTypes.func,
}

SvgFeatureRendering.defaultProps = {
  horizontallyFlipped: false,
  targetType: 'feature',
  session: undefined,

  features: new Map(),

  onMouseDown: undefined,
  onMouseUp: undefined,
  onMouseEnter: undefined,
  onMouseLeave: undefined,
  onMouseOver: undefined,
  onMouseOut: undefined,
  onClick: undefined,
}

export default observer(SvgFeatureRendering)
