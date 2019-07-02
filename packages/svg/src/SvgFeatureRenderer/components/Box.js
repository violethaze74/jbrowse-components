import { readConfObject } from '@gmod/jbrowse-core/configuration'
import { PropTypes as CommonPropTypes } from '@gmod/jbrowse-core/mst-types'
import { featureSpanPx } from '@gmod/jbrowse-core/util'
import { emphasize } from '@gmod/jbrowse-core/util/color'
import SceneGraph from '@gmod/jbrowse-core/util/layouts/SceneGraph'
import { observer } from 'mobx-react'
import ReactPropTypes from 'prop-types'
import React, { useState } from 'react'
import './SvgFeatureRendering.scss'

function Label({ layoutRecord, fontHeight, color, children }) {
  return (
    <text
      x={layoutRecord.left}
      y={layoutRecord.top}
      style={{ fontSize: fontHeight, fill: color }}
      dominantBaseline="hanging"
    >
      {children}
    </text>
  )
}
Label.propTypes = {
  layoutRecord: ReactPropTypes.shape({
    left: ReactPropTypes.number.isRequired,
  }).isRequired,
  fontHeight: ReactPropTypes.number.isRequired,
  children: ReactPropTypes.node.isRequired,
  color: ReactPropTypes.string,
}
Label.defaultProps = {
  color: 'black',
}

function Box(props) {
  const [mouseIsDown, setMouseIsDown] = useState(false)
  const [movedDuringLastMouseDown, setMovedDuringLastMouseDown] = useState(
    false,
  )

  const {
    feature,
    config,
    layoutRecord: {
      rootLayout,
      name,
      description,
      shouldShowDescription,
      shouldShowName,
      fontHeight,
    },
    selectedFeatureId,
    hoveredFeatureId,
    targetType,
    session,
  } = props

  function onFeatureMouseDown(event) {
    setMouseIsDown(true)
    setMovedDuringLastMouseDown(false)
    session.event(event, feature, targetType)
    const { onFeatureMouseDown: handler } = props
    if (!handler) return undefined
    return handler(event, feature.id())
  }

  function onFeatureMouseEnter(event) {
    session.event(event, feature, targetType)
    const { onFeatureMouseEnter: handler } = props
    if (!handler) return undefined
    return handler(event, feature.id())
  }

  function onFeatureMouseOut(event) {
    session.event(event, feature, targetType)
    const { onFeatureMouseOut: handler } = props
    if (!handler) return undefined
    return handler(event, feature.id())
  }

  function onFeatureMouseOver(event) {
    session.event(event, feature, targetType)
    const { onFeatureMouseOver: handler } = props
    if (!handler) return undefined
    return handler(event, feature.id())
  }

  function onFeatureMouseUp(event) {
    session.event(event, feature, targetType)
    setMouseIsDown(false)
    const { onFeatureMouseUp: handler } = props
    if (!handler) return undefined
    return handler(event, feature.id())
  }

  function onFeatureMouseLeave(event) {
    session.event(event, feature, targetType)
    const { onFeatureMouseLeave: handler } = props
    if (!handler) return undefined
    return handler(event, feature.id())
  }

  function onFeatureMouseMove(event) {
    session.event(event, feature, targetType)
    if (mouseIsDown) setMovedDuringLastMouseDown(true)
    const { onFeatureMouseMove: handler } = props
    if (!handler) return undefined
    return handler(event, feature.id())
  }

  function onFeatureClick(event) {
    event.stopPropagation()
    if (!movedDuringLastMouseDown) {
      const { onFeatureClick: handler } = props
      session.event(event, feature, targetType)
      if (!handler) return undefined
      return handler(event, feature.id())
    }
    return undefined
  }

  const style = { fill: readConfObject(config, 'color1', [feature]) }
  if (String(selectedFeatureId) === String(feature.id())) style.stroke = 'black'
  if (String(hoveredFeatureId) === String(feature.id()))
    style.fill = emphasize(style.fill, 0.4)

  const featureLayout = rootLayout.getSubRecord('feature')

  return (
    <g transform={`translate(${rootLayout.left} ${rootLayout.top})`}>
      <rect
        title={feature.id()}
        x={featureLayout.left}
        y={featureLayout.top}
        width={Math.max(featureLayout.width, 1)}
        height={featureLayout.height}
        style={style}
        onMouseDown={onFeatureMouseDown}
        onMouseEnter={onFeatureMouseEnter}
        onMouseOut={onFeatureMouseOut}
        onMouseOver={onFeatureMouseOver}
        onMouseUp={onFeatureMouseUp}
        onMouseLeave={onFeatureMouseLeave}
        onMouseMove={onFeatureMouseMove}
        onClick={onFeatureClick}
        onFocus={onFeatureMouseOver}
        onBlur={onFeatureMouseOut}
      >
        <title>{feature.get('name')}</title>
      </rect>
      {!shouldShowName ? null : (
        <Label
          layoutRecord={rootLayout.getSubRecord('nameLabel')}
          fontHeight={fontHeight}
          color={readConfObject(config, ['labels', 'nameColor'], [feature])}
        >
          {name}
        </Label>
      )}
      {!shouldShowDescription ? null : (
        <Label
          layoutRecord={rootLayout.getSubRecord('descriptionLabel')}
          fontHeight={fontHeight}
          color={readConfObject(
            config,
            ['labels', 'descriptionColor'],
            [feature],
          )}
        >
          {description}
        </Label>
      )}
    </g>
  )
}

Box.propTypes = {
  feature: ReactPropTypes.shape({ get: ReactPropTypes.func.isRequired })
    .isRequired,
  // horizontallyFlipped: ReactPropTypes.bool,
  // bpPerPx: ReactPropTypes.number.isRequired,
  // region: CommonPropTypes.Region.isRequired,
  // config: CommonPropTypes.ConfigSchema.isRequired,
  layoutRecord: ReactPropTypes.shape({
    rootLayout: ReactPropTypes.shape({
      left: ReactPropTypes.number.isRequired,
    }).isRequired,
    name: ReactPropTypes.string,
    description: ReactPropTypes.string,
    shouldShowDescription: ReactPropTypes.bool,
    shouldShowName: ReactPropTypes.bool,
    fontHeight: ReactPropTypes.number,
  }).isRequired,

  targetType: ReactPropTypes.string,
  selectedFeatureId: ReactPropTypes.string,

  config: CommonPropTypes.ConfigSchema.isRequired,

  onFeatureMouseDown: ReactPropTypes.func,
  onFeatureMouseEnter: ReactPropTypes.func,
  onFeatureMouseOut: ReactPropTypes.func,
  onFeatureMouseOver: ReactPropTypes.func,
  onFeatureMouseUp: ReactPropTypes.func,
  onFeatureMouseLeave: ReactPropTypes.func,
  onFeatureMouseMove: ReactPropTypes.func,

  // synthesized from mouseup and mousedown
  onFeatureClick: ReactPropTypes.func,
}

Box.defaultProps = {
  // horizontallyFlipped: false,

  targetType: 'feature',
  selectedFeatureId: undefined,

  onFeatureMouseDown: undefined,
  onFeatureMouseEnter: undefined,
  onFeatureMouseOut: undefined,
  onFeatureMouseOver: undefined,
  onFeatureMouseUp: undefined,
  onFeatureMouseLeave: undefined,
  onFeatureMouseMove: undefined,

  onFeatureClick: undefined,
}

Box.layout = args => {
  const { feature, bpPerPx, region, layout, horizontallyFlipped } = args

  const [startPx, endPx] = featureSpanPx(
    feature,
    region,
    bpPerPx,
    horizontallyFlipped,
  )
  const rootLayout = new SceneGraph('root', startPx, 0, 0, 0)
  const featureHeight = readConfObject(args.config, 'height', [feature])
  rootLayout.addChild('feature', 0, 0, endPx - startPx, featureHeight)

  const name = readConfObject(args.config, ['labels', 'name'], [feature]) || ''
  const description =
    readConfObject(args.config, ['labels', 'description'], [feature]) || ''
  const fontHeight = readConfObject(
    args.config,
    ['labels', 'fontSize'],
    ['feature'],
  )
  const fontWidth = fontHeight * 0.75
  const shouldShowName = /\S/.test(name)
  const shouldShowDescription = /\S/.test(description)
  const textVerticalPadding = 2
  if (shouldShowName) {
    rootLayout.addChild(
      'nameLabel',
      0,
      rootLayout.getSubRecord('feature').bottom + textVerticalPadding,
      name.length * fontWidth,
      fontHeight,
    )
  }
  if (shouldShowDescription) {
    rootLayout.addChild(
      'descriptionLabel',
      0,
      rootLayout.getSubRecord(shouldShowName ? 'nameLabel' : 'feature').bottom +
        textVerticalPadding,
      description.length * fontWidth,
      fontHeight,
    )
  }

  const topPx = layout.addRect(
    feature.id(),
    feature.get('start'),
    feature.get('end'),
    rootLayout.height,
  )

  rootLayout.move(0, topPx)

  return {
    rootLayout,
    name,
    description,
    shouldShowDescription,
    shouldShowName,
    fontHeight,
  }
}

export default observer(Box)
