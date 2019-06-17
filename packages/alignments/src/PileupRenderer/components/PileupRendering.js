import PrerenderedCanvas from '@gmod/jbrowse-core/components/PrerenderedCanvas'
import { PropTypes as CommonPropTypes } from '@gmod/jbrowse-core/mst-types'
import { bpToPx } from '@gmod/jbrowse-core/util'
import { observer } from 'mobx-react'
import ReactPropTypes from 'prop-types'
import React, { useEffect, useRef, useState } from 'react'

const layoutPropType = ReactPropTypes.shape({
  getRectangles: ReactPropTypes.func.isRequired,
})

function PileupRendering(props) {
  const highlightOverlayCanvas = useRef()
  const [featureIdUnderMouse, setFeatureIdUnderMouse] = useState()
  const [mouseIsDown, setMouseIsDown] = useState(false)
  const [movedDuringLastMouseDown, setMovedDuringLastMouseDown] = useState(
    false,
  )

  const {
    trackModel,
    region,
    bpPerPx,
    layout,
    horizontallyFlipped,
    width,
    height,
  } = props
  const { selectedFeatureId } = trackModel

  useEffect(() => {
    function updateSelectionHighlight() {
      const canvas = highlightOverlayCanvas.current
      if (!canvas) return
      const ctx = canvas.getContext('2d')
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      if (selectedFeatureId) {
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
            return
          }
        }
      }
    }

    updateSelectionHighlight()
  }, [bpPerPx, horizontallyFlipped, layout, region, selectedFeatureId])

  function onMouseDown(event) {
    setMouseIsDown(true)
    setMovedDuringLastMouseDown(false)
    callMouseHandler('MouseDown', event)
  }

  function onMouseEnter(event) {
    callMouseHandler('MouseEnter', event)
  }

  function onMouseOut(event) {
    callMouseHandler('MouseOut', event)
    callMouseHandler('MouseLeave', event)
    setFeatureIdUnderMouse(undefined)
  }

  function onMouseOver(event) {
    callMouseHandler('MouseOver', event)
  }

  function onMouseUp(event) {
    setMouseIsDown(false)
    callMouseHandler('MouseUp', event)
  }

  function onClick(event) {
    if (!movedDuringLastMouseDown) callMouseHandler('Click', event)
  }

  function onMouseLeave(event) {
    callMouseHandler('MouseOut', event)
    callMouseHandler('MouseLeave', event)
    setFeatureIdUnderMouse(undefined)
  }

  function onMouseMove(event) {
    if (mouseIsDown) setMovedDuringLastMouseDown(true)
    const featureIdCurrentlyUnderMouse = findFeatureIdUnderMouse(event)
    if (featureIdUnderMouse === featureIdCurrentlyUnderMouse) {
      callMouseHandler('MouseMove', event)
    } else {
      if (featureIdUnderMouse) {
        callMouseHandler('MouseOut', event)
        callMouseHandler('MouseLeave', event)
      }
      setFeatureIdUnderMouse(featureIdCurrentlyUnderMouse)
      callMouseHandler('MouseOver', event)
      callMouseHandler('MouseEnter', event)
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

  /**
   * @param {string} handlerName
   * @param {*} event - the actual mouse event
   * @param {bool} always - call this handler even if there is no feature
   */
  function callMouseHandler(handlerName, event, always = false) {
    // eslint-disable-next-line react/destructuring-assignment
    const featureHandler = props[`onFeature${handlerName}`]
    // eslint-disable-next-line react/destructuring-assignment
    const canvasHandler = props[`on${handlerName}`]
    if (featureHandler && (always || featureIdUnderMouse)) {
      featureHandler(event, featureIdUnderMouse)
    } else if (canvasHandler) {
      canvasHandler(event, featureIdUnderMouse)
    }
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
  layout: layoutPropType.isRequired,
  height: ReactPropTypes.number.isRequired,
  width: ReactPropTypes.number.isRequired,
  region: CommonPropTypes.Region.isRequired,
  bpPerPx: ReactPropTypes.number.isRequired,
  horizontallyFlipped: ReactPropTypes.bool,

  trackModel: ReactPropTypes.shape({
    /** id of the currently selected feature, if any */
    selectedFeatureId: ReactPropTypes.string,
  }),

  onFeatureMouseDown: ReactPropTypes.func,
  onFeatureMouseEnter: ReactPropTypes.func,
  onFeatureMouseOut: ReactPropTypes.func,
  onFeatureMouseOver: ReactPropTypes.func,
  onFeatureMouseUp: ReactPropTypes.func,
  onFeatureMouseLeave: ReactPropTypes.func,
  onFeatureMouseMove: ReactPropTypes.func,

  // synthesized from mouseup and mousedown
  onFeatureClick: ReactPropTypes.func,

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

  trackModel: {},

  onFeatureMouseDown: undefined,
  onFeatureMouseEnter: undefined,
  onFeatureMouseOut: undefined,
  onFeatureMouseOver: undefined,
  onFeatureMouseUp: undefined,
  onFeatureMouseLeave: undefined,
  onFeatureMouseMove: undefined,

  onFeatureClick: undefined,

  onMouseDown: undefined,
  onMouseUp: undefined,
  onMouseEnter: undefined,
  onMouseLeave: undefined,
  onMouseOver: undefined,
  onMouseOut: undefined,

  onClick: undefined,
}

export default observer(PileupRendering)
