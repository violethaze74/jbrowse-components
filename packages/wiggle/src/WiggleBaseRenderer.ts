import {
  createCanvas,
  createImageBitmap,
} from '@gmod/jbrowse-core/util/offscreenCanvasPonyfill'
import { Feature } from '@gmod/jbrowse-core/util/simpleFeature'
import { IRegion } from '@gmod/jbrowse-core/mst-types'
import BaseAdapter from '@gmod/jbrowse-core/BaseAdapter'
import ServerSideRendererType from '@gmod/jbrowse-core/pluggableElementTypes/renderers/ServerSideRendererType'
import React from 'react'
import { ScaleOpts } from './util'

interface WiggleBaseRendererProps {
  features: Map<string, Feature>
  layout: any // eslint-disable-line @typescript-eslint/no-explicit-any
  config: any // eslint-disable-line @typescript-eslint/no-explicit-any
  region: IRegion
  bpPerPx: number
  height: number
  width: number
  horizontallyFlipped: boolean
  highResolutionScaling: number
  blockKey: string
  dataAdapter: BaseAdapter
  notReady: boolean
  originalRegion: IRegion
  scaleOpts: ScaleOpts
  sessionId: string
  signal: AbortSignal
  trackModel: unknown
}

export default class extends ServerSideRendererType {
  async makeImageData(props: WiggleBaseRendererProps) {
    const { height, region, bpPerPx, highResolutionScaling = 1 } = props
    const width = (region.end - region.start) / bpPerPx
    if (!(width > 0) || !(height > 0)) {
      return { height: 0, width: 0 }
    }
    const canvas = createCanvas(
      Math.ceil(width * highResolutionScaling),
      height * highResolutionScaling,
    )
    const ctx = canvas.getContext('2d')
    ctx.scale(highResolutionScaling, highResolutionScaling)
    this.draw(ctx, props)

    const imageData = await createImageBitmap(canvas)
    return { imageData, height, width }
  }

  draw(ctx: CanvasRenderingContext2D, props: WiggleBaseRendererProps) {
    /* draw features to context given props */
  }

  calculatePixelScores(props: WiggleBaseRendererProps) {
    const { region, bpPerPx, features } = props
    const width = Math.ceil((region.end - region.start) / bpPerPx)
    const pixelValues = new Array(width)

    const featureRects = []

    for (const feature of features.values()) {
      featureRects.push(
        this.featureRect(1 / bpPerPx, region.start, width, feature),
      )
    }

    featureRects.forEach(fRect => {
      const jEnd = fRect.r
      const score = fRect.feature.get('score')
      for (let j = Math.round(fRect.l); j < jEnd; j++) {
        // bin scores according to store
        if (pixelValues[j]) {
          pixelValues[j].scores.push(score)
        } else if (pixelValues[j]) {
          pixelValues[j].scores = [score]
        } else {
          pixelValues[j] = { scores: {}, feature: fRect.feature }
          pixelValues[j].scores = [score]
        }
      }
    })

    // when done looping through features, average the scores in the same store then add them all together as the final score
    for (let i = 0; i < pixelValues.length; i++) {
      if (pixelValues[i]) {
        pixelValues[i].score = 0
        // eslint-disable-next-line guard-for-in
        let sum = 0
        const len = pixelValues[i].scores.length
        for (let j = 0; j < len; j++) {
          sum += pixelValues[i].scores[j]
        }
        pixelValues[i].score += sum / len
        delete pixelValues[i].scores
      }
    }
    return pixelValues
  }

  featureRect(
    scale: number,
    leftBase: number,
    canvasWidth: number,
    feature: Feature,
  ) {
    let w = Math.ceil((feature.get('end') - feature.get('start')) * scale)
    let l = Math.round((feature.get('start') - leftBase) * scale)

    // if l is negative (off the left
    // side of the canvas), clip off the
    // (possibly large!) non-visible
    // portion
    if (l < 0) {
      w += l
      l = 0
    }

    // also don't let fRect.w get overly big
    w = Math.min(canvasWidth - l, w)

    return {
      w,
      l,
      r: w + l,
      feature,
    }
  }

  // @ts-ignore
  async render(renderProps: WiggleBaseRendererProps) {
    const { height, width, imageData } = await this.makeImageData(renderProps)
    const element = React.createElement(
      // @ts-ignore
      this.ReactComponent,
      { ...renderProps, height, width, imageData },
      null,
    )
    return { element, imageData, height, width }
  }
}
