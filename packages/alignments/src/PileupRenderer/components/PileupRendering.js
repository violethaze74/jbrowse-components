import PrerenderedCanvas from '@gmod/jbrowse-core/components/PrerenderedCanvas'
import { PropTypes as CommonPropTypes } from '@gmod/jbrowse-core/mst-types'
import { bpToPx } from '@gmod/jbrowse-core/util'
import { observer, PropTypes as MobxPropTypes } from 'mobx-react'
import ReactPropTypes from 'prop-types'
import React, { useEffect, useRef, useState } from 'react'

function PileupRendering(props) {
  const highlightOverlayCanvas = useRef()
  const [mouseIsDown, setMouseIsDown] = useState(false)
  const [movedDuringLastMouseDown, setMovedDuringLastMouseDown] = useState(
    false,
  )

  const {
    region,
    bpPerPx,
    layout,
    horizontallyFlipped,
    width,
    height,
    getFeature,
    targetType,
    session,
  } = props

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

  // is the globally-selected thing probably a feature?
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

  useEffect(() => {
    function updateHighlights() {
      const canvas = highlightOverlayCanvas.current
      if (!canvas) return
      const ctx = canvas.getContext('2d')
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      if (hoveredFeatureId) {
        for (const [
          id,
          [leftBp, topPx, rightBp, bottomPx],
        ] of layout.getRectangles()) {
          if (String(id) === String(selectedFeatureId)) {
            const leftPx = Math.round(
              bpToPx(leftBp, region, bpPerPx, horizontallyFlipped),
            )
            const rightPx = Math.round(
              bpToPx(rightBp, region, bpPerPx, horizontallyFlipped),
            )
            const top = Math.round(topPx)
            const highlightHeight = Math.round(bottomPx - topPx)
            ctx.shadowColor = '#222266'
            ctx.shadowBlur = 10
            ctx.lineJoin = 'bevel'
            ctx.lineWidth = 2
            ctx.strokeStyle = '#00b8ff'
            ctx.strokeRect(
              leftPx - 2,
              top - 2,
              rightPx - leftPx + 4,
              highlightHeight + 4,
            )
            ctx.clearRect(leftPx, top, rightPx - leftPx, highlightHeight)
            break
          }
        }
      }
      if (hoveredFeatureId) {
        for (const [
          id,
          [leftBp, topPx, rightBp, bottomPx],
        ] of layout.getRectangles()) {
          if (String(id) === String(hoveredFeatureId)) {
            const leftPx = Math.round(
              bpToPx(leftBp, region, bpPerPx, horizontallyFlipped),
            )
            const rightPx = Math.round(
              bpToPx(rightBp, region, bpPerPx, horizontallyFlipped),
            )
            const top = Math.round(topPx)
            const highlightHeight = Math.round(bottomPx - topPx)
            ctx.fillStyle = 'rgba(0,0,0,0.3)'
            ctx.fillRect(leftPx, top, rightPx - leftPx, highlightHeight)
            break
          }
        }
      }
    }

    updateHighlights()
  }, [
    bpPerPx,
    horizontallyFlipped,
    layout,
    region,
    selectedFeatureId,
    hoveredFeatureId,
  ])

  function onMouseDown(event) {
    setMouseIsDown(true)
    setMovedDuringLastMouseDown(false)
    session.event(event, getFeature(hoveredFeatureId), targetType)
    props.onMouseDown(event)
  }

  function onMouseEnter(event) {
    session.event(event, getFeature(hoveredFeatureId), targetType)
    props.onMouseEnter(event)
  }

  function onMouseOut(event) {
    session.event(event, undefined, targetType)
    props.onMouseOut(event)
    props.onMouseLeave(event)
  }

  function onMouseOver(event) {
    session.event(event, getFeature(hoveredFeatureId), targetType)
    props.onMouseOver(event)
  }

  function onMouseUp(event) {
    setMouseIsDown(false)
    session.event(event, getFeature(hoveredFeatureId), targetType)
    props.onMouseUp(event)
  }

  function onClick(event) {
    if (!movedDuringLastMouseDown) {
      session.event(event, getFeature(hoveredFeatureId), targetType)
      props.onClick(event)
    }
  }

  function onMouseLeave(event) {
    session.event(event, undefined, targetType)
    props.onMouseOut(event)
    props.onMouseLeave(event)
  }

  function onContextMenu(event) {
    event.preventDefault()
    session.event(
      { type: 'contextmenu', ...event },
      getFeature(hoveredFeatureId),
      targetType,
    )
  }

  function onMouseMove(event) {
    if (mouseIsDown) setMovedDuringLastMouseDown(true)
    const featureIdCurrentlyUnderMouse = findFeatureIdUnderMouse(event)
    if (hoveredFeatureId !== featureIdCurrentlyUnderMouse) {
      if (hoveredFeatureId) {
        session.event(
          { ...event, type: 'mouseout' },
          getFeature(hoveredFeatureId),
          targetType,
        )
        session.event(
          { ...event, type: 'mouseleave' },
          getFeature(hoveredFeatureId),
          targetType,
        )
        props.onMouseOut(event)
        props.onMouseLeave(event)
      }
      session.event(
        { ...event, type: 'mouseover' },
        getFeature(featureIdCurrentlyUnderMouse),
        targetType,
      )
      session.event(
        { ...event, type: 'mouseenter' },
        getFeature(featureIdCurrentlyUnderMouse),
        targetType,
      )
      props.onMouseOver(event)
      props.onMouseEnter(event)
    }
  }

  function findFeatureIdUnderMouse(event) {
    const { offsetX, offsetY } = event.nativeEvent
    if (!(offsetX >= 0))
      throw new Error(
        'invalid offsetX, does this browser provide offsetX and offsetY on mouse events?',
      )

    for (const [
      id,
      [leftBp, topPx, rightBp, bottomPx],
    ] of layout.getRectangles()) {
      let leftPx = bpToPx(leftBp, region, bpPerPx, horizontallyFlipped)
      let rightPx = bpToPx(rightBp, region, bpPerPx, horizontallyFlipped)
      if (horizontallyFlipped) {
        ;[leftPx, rightPx] = [rightPx, leftPx]
      }
      if (
        offsetX >= leftPx &&
        offsetX <= rightPx &&
        offsetY >= topPx &&
        offsetY <= bottomPx
      ) {
        return id
      }
    }

    return undefined
  }

  const canvasWidth = Math.ceil(width)
  return (
    <div className="PileupRendering" style={{ position: 'relative' }}>
      <PrerenderedCanvas
        {...props}
        style={{ position: 'absolute', left: 0, top: 0 }}
      />
      <canvas
        width={canvasWidth}
        height={height}
        style={{ position: 'absolute', left: 0, top: 0 }}
        className="highlightOverlayCanvas"
        ref={highlightOverlayCanvas}
        onContextMenu={onContextMenu}
        onMouseDown={onMouseDown}
        onMouseEnter={onMouseEnter}
        onMouseOut={onMouseOut}
        onMouseOver={onMouseOver}
        onMouseUp={onMouseUp}
        onMouseLeave={onMouseLeave}
        onMouseMove={onMouseMove}
        onFocus={() => {}}
        onBlur={() => {}}
        onClick={onClick}
      />
    </div>
  )
}

PileupRendering.propTypes = {
  layout: ReactPropTypes.shape({
    getRectangles: ReactPropTypes.func.isRequired,
  }).isRequired,
  height: ReactPropTypes.number.isRequired,
  width: ReactPropTypes.number.isRequired,
  region: CommonPropTypes.Region.isRequired,
  bpPerPx: ReactPropTypes.number.isRequired,
  horizontallyFlipped: ReactPropTypes.bool,

  session: MobxPropTypes.objectOrObservableObject.isRequired,
  getFeature: ReactPropTypes.func.isRequired,

  targetType: ReactPropTypes.string,

  onMouseDown: ReactPropTypes.func,
  onMouseUp: ReactPropTypes.func,
  onMouseEnter: ReactPropTypes.func,
  onMouseLeave: ReactPropTypes.func,
  onMouseOver: ReactPropTypes.func,
  onMouseOut: ReactPropTypes.func,

  onClick: ReactPropTypes.func,
}

PileupRendering.defaultProps = {
  horizontallyFlipped: false,

  targetType: 'feature',

  onMouseDown: () => {},
  onMouseUp: () => {},
  onMouseEnter: () => {},
  onMouseLeave: () => {},
  onMouseOver: () => {},
  onMouseOut: () => {},

  onClick: () => {},
}

export default observer(PileupRendering)
