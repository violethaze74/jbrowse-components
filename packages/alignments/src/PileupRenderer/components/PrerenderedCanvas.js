import { ImageBitmapType } from '@gmod/jbrowse-core/util/offscreenCanvasPonyfill'
import ReactPropTypes from 'prop-types'
import React, { useEffect, useRef } from 'react'

function PrerenderedCanvas(props) {
  const featureCanvas = useRef()

  useEffect(() => {
    function draw() {
      const { imageData } = props
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

  const { width, height } = props
  return <canvas ref={featureCanvas} width={width} height={height} />
}

PrerenderedCanvas.propTypes = {
  height: ReactPropTypes.number.isRequired,
  width: ReactPropTypes.number.isRequired,
  imageData: ReactPropTypes.instanceOf(ImageBitmapType),
}

PrerenderedCanvas.defaultProps = { imageData: undefined }

export default PrerenderedCanvas
