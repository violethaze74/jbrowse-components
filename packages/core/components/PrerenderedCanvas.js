import ReactPropTypes from 'prop-types'
import React, { useEffect, useRef } from 'react'
import { ImageBitmapType } from '../util/offscreenCanvasPonyfill'

function PrerenderedCanvas(props) {
  const featureCanvas = useRef()
  const { width, height, highResolutionScaling, style, imageData } = props

  useEffect(() => {
    function draw() {
      if (!imageData) return
      if (imageData instanceof ImageBitmap) {
        const canvas = featureCanvas.current
        const context = canvas.getContext('2d')
        context.drawImage(imageData, 0, 0)
      } else {
        // TODO: add support for replay-based image data here
        throw new Error(
          'unsupported imageData type. do you need to add support for it?',
        )
      }
    }

    draw()
  })

  return (
    <canvas
      ref={featureCanvas}
      width={width * highResolutionScaling}
      height={height * highResolutionScaling}
      style={{ width, height, ...style }}
    />
  )
}

PrerenderedCanvas.propTypes = {
  height: ReactPropTypes.number.isRequired,
  width: ReactPropTypes.number.isRequired,
  highResolutionScaling: ReactPropTypes.number,
  imageData: ReactPropTypes.instanceOf(ImageBitmapType),
  style: ReactPropTypes.objectOf(ReactPropTypes.any),
}

PrerenderedCanvas.defaultProps = {
  imageData: undefined,
  highResolutionScaling: 1,
  style: {},
}

export default PrerenderedCanvas
