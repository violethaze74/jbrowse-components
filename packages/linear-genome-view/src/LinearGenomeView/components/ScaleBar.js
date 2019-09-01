import { makeStyles } from '@material-ui/core/styles'
import { observer, PropTypes as MobxPropTypes } from 'mobx-react'
import PropTypes from 'prop-types'
import React from 'react'
import Block from '../../BasicTrack/components/Block'
import Ruler from './Ruler'

const useStyles = makeStyles((/* theme */) => ({
  scaleBar: {
    background: '#555',
    height: 32,
    overflow: 'hidden',
    boxSizing: 'border-box',
  },
  refLabel: {
    fontSize: '16px',
    position: 'absolute',
    left: '2px',
    top: '-1px',
    fontWeight: 'bold',
    background: 'white',
    // color: theme.palette.text.primary,
  },
}))

function findBlockContainingLeftSideOfView(offsetPx, blockSet) {
  const blocks = blockSet.getBlocks()
  for (let i = 0; i < blocks.length; i += 1) {
    const block = blocks[i]
    if (block.offsetPx <= offsetPx && block.offsetPx + block.widthPx > offsetPx)
      return block
  }
  return undefined
}

function ScaleBar({ model, height }) {
  const classes = useStyles()
  const blockContainingLeftEndOfView = findBlockContainingLeftSideOfView(
    model.offsetPx,
    model.staticBlocks,
  )

  const blockDefinitions = model.staticBlocks
  const blockOffsetPx = (blockDefinitions.getBlocks()[0] || {}).offsetPx

  return (
    <div className={classes.scaleBar}>
      <div
        style={{
          transform: `translate(${blockOffsetPx - model.offsetPx}px, 0)`,
        }}
      >
        {blockDefinitions.map(block => {
          return (
            <Block
              key={block.offsetPx}
              offsetPx={block.offsetPx - blockOffsetPx}
              block={block}
              height={height - 1}
            >
              <svg height={height - 1} width={block.widthPx}>
                <Ruler
                  region={block}
                  showRefNameLabel={
                    !!block.isLeftEndOfDisplayedRegion &&
                    block !== blockContainingLeftEndOfView
                  }
                  bpPerPx={model.bpPerPx}
                  flipped={model.horizontallyFlipped}
                />
              </svg>
            </Block>
          )
        })}
        {// put in a floating ref label
        blockContainingLeftEndOfView ? (
          <div className={classes.refLabel}>
            {blockContainingLeftEndOfView.refName}
          </div>
        ) : null}
      </div>
    </div>
  )
}
ScaleBar.defaultProps = {
  style: {},
}
ScaleBar.propTypes = {
  model: MobxPropTypes.objectOrObservableObject.isRequired,
  height: PropTypes.number.isRequired,
}

const ScaleBarObserver = observer(ScaleBar)
export default ScaleBarObserver
