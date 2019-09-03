import { makeStyles } from '@material-ui/core/styles'
import { observer, PropTypes } from 'mobx-react'
import ReactPropTypes from 'prop-types'
import React from 'react'
import { ContentBlock, ElidedBlock } from '../util/blockTypes'
import Block from './Block'

const useStyles = makeStyles({
  trackBlocks: {
    whiteSpace: 'nowrap',
    textAlign: 'left',
    width: '100%',
    background: '#404040',
    minHeight: '100%',
  },
  elidedBlock: {
    position: 'absolute',
    minHeight: '100%',
    boxSizing: 'border-box',
    backgroundColor: '#999',
    backgroundImage:
      'repeating-linear-gradient(90deg, transparent, transparent 1px, rgba(255,255,255,.5) 1px, rgba(255,255,255,.5) 3px)',
  },

  heightOverflowed: {
    position: 'absolute',
    color: 'rgb(77,77,77)',
    borderBottom: '2px solid rgb(77,77,77)',
    textShadow: 'white 0px 0px 1px',
    whiteSpace: 'nowrap',
    width: '100%',
    fontWeight: 'bold',
    textAlign: 'center',
    zIndex: 2000,
    boxSizing: 'border-box',
  },
})

const ElidedBlockMarker = ({ width, offset, height }) => {
  const classes = useStyles()
  return (
    <div
      className={classes.elidedBlock}
      style={{
        width: `${width}px`,
        transform: `translate(${offset}px, 0)`,
        height: `${height}px`,
      }}
    />
  )
}
ElidedBlockMarker.propTypes = {
  width: ReactPropTypes.number.isRequired,
  offset: ReactPropTypes.number.isRequired,
  height: ReactPropTypes.number.isRequired,
}

// const BlockSet = observer(function BlockSet({}) {

// })

function TrackBlocks({ model, viewModel, blockState }) {
  const classes = useStyles()
  const { blockDefinitions } = model
  const blockOffsetPx = (blockDefinitions.getBlocks()[0] || {}).offsetPx
  return (
    <div
      data-testid="Block"
      className={classes.trackBlocks}
      style={{
        transform: `translate(${blockOffsetPx - viewModel.offsetPx}px, 0)`,
      }}
    >
      {blockDefinitions.map(block => {
        if (block instanceof ContentBlock) {
          const state = blockState.get(block.key)
          return (
            <Block
              key={block.offsetPx}
              offsetPx={block.offsetPx - blockOffsetPx}
              block={block}
              height={model.height}
            >
              {state && state.reactComponent ? (
                <state.reactComponent model={state} />
              ) : null}
              {state && state.maxHeightReached ? (
                <div
                  className={classes.heightOverflowed}
                  style={{
                    top: state.data.layout.totalHeight - 16,
                    height: 16,
                  }}
                >
                  Max height reached
                </div>
              ) : null}
            </Block>
          )
        }
        if (block instanceof ElidedBlock) {
          return (
            <ElidedBlockMarker
              key={block.key}
              width={block.widthPx}
              offset={block.offsetPx - blockOffsetPx}
              height={model.height}
            />
          )
        }
        return null
      })}
    </div>
  )
}

TrackBlocks.propTypes = {
  blockState: PropTypes.observableMap.isRequired,
  model: PropTypes.observableObject.isRequired,
  viewModel: PropTypes.observableObject.isRequired,
}

export default observer(TrackBlocks)
