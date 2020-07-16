import PropTypes from 'prop-types'
import React from 'react'

export default function Label(props) {
  const {
    text,
    x,
    y,
    color = 'black',
    fontHeight = 13,
    featureWidth,
    reversed,
    allowedWidthExpansion,
    fontWidthScaleFactor = 0.6,
  } = props

  const fontWidth = fontHeight * fontWidthScaleFactor
  const totalWidth =
    featureWidth && allowedWidthExpansion
      ? featureWidth + allowedWidthExpansion
      : Infinity

  return (
    <text
      x={reversed ? x + (featureWidth || 0) - fontWidth * text.length : x}
      y={y}
      style={{
        fontSize: fontHeight,
        fill: color,
        cursor: 'default',
        fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
      }}
      dominantBaseline="hanging"
    >
      {fontWidth * text.length > totalWidth
        ? `${text.slice(0, totalWidth / fontWidth)}...`
        : text}
    </text>
  )
}

Label.propTypes = {
  text: PropTypes.string.isRequired,
  x: PropTypes.number.isRequired,
  y: PropTypes.number.isRequired,
  color: PropTypes.string,
  fontHeight: PropTypes.number,
  featureWidth: PropTypes.number.isRequired,
  reversed: PropTypes.bool.isRequired,
  allowedWidthExpansion: PropTypes.string.isRequired,
  fontWidthScaleFactor: PropTypes.number,
}

Label.defaultProps = {
  color: 'black',
  fontHeight: 13,
  fontWidthScaleFactor: 0.6,
}
