import { Icon, IconButton, withStyles } from '@material-ui/core'
import ToggleButton from '@material-ui/lab/ToggleButton'
import classnames from 'classnames'
import { observer, PropTypes } from 'mobx-react'
import ReactPropTypes from 'prop-types'
import React from 'react'
import BlockBasedTrack from '../../BasicTrack/components/BlockBasedTrack'
import TrackControls from '../../BasicTrack/components/TrackControls'
import Rubberband from './Rubberband'
import ScaleBar from './ScaleBar'
import TrackRenderingContainer from './TrackRenderingContainer'
import TrackResizeHandle from './TrackResizeHandle'
import ZoomControls from './ZoomControls'

const dragHandleHeight = 3

const styles = theme => ({
  root: {
    position: 'relative',
    marginBottom: theme.spacing.unit,
    overflow: 'hidden',
  },
  linearGenomeView: {
    background: '#eee',
    // background: theme.palette.background.paper,
    boxSizing: 'content-box',
  },
  controls: {
    borderRight: '1px solid gray',
    overflow: 'hidden',
    whiteSpace: 'nowrap',
    textOverflow: 'ellipsis',
  },
  viewControls: {
    height: '100%',
    borderBottom: '1px solid #9e9e9e',
    boxSizing: 'border-box',
  },
  trackControls: {
    whiteSpace: 'normal',
  },
  zoomControls: {
    position: 'absolute',
    top: '0px',
  },
  iconButton: {
    padding: theme.spacing.unit / 2,
  },
})

function LinearGenomeView(props) {
  const scaleBarHeight = 32
  const { classes, model, getTrackType, session } = props
  const {
    id,
    staticBlocks,
    tracks,
    bpPerPx,
    width,
    controlsWidth,
    offsetPx,
  } = model
  /*
   * NOTE: offsetPx is the total offset in px of the viewing window into the
   * whole set of concatenated regions. this number is often quite large.
   */
  const height =
    scaleBarHeight + tracks.reduce((a, b) => a + b.height + dragHandleHeight, 0)
  const style = {
    display: 'grid',
    width: `${width}px`,
    height: `${height}px`,
    position: 'relative',
    gridTemplateRows: `[scale-bar] auto ${tracks
      .map(
        t =>
          `[track-${t.id}] ${t.height}px [resize-${
            t.id
          }] ${dragHandleHeight}px`,
      )
      .join(' ')}`,
    gridTemplateColumns: `[controls] ${controlsWidth}px [blocks] auto`,
  }
  // console.log(style)
  function activateTrackSelector() {
    if (model.trackSelectorType === 'hierarchical') {
      const drawerWidgetId = `hierarchicalTrackSelector-${model.id}`
      if (!session.drawerWidgets.get(drawerWidgetId))
        session.addDrawerWidget(
          'HierarchicalTrackSelectorDrawerWidget',
          drawerWidgetId,
          { view: model },
        )
      const selector = session.drawerWidgets.get(drawerWidgetId)
      selector.setView(model)
      session.showDrawerWidget(drawerWidgetId)
    } else {
      throw new Error(`invalid track selector type ${model.trackSelectorType}`)
    }
  }

  return (
    <div className={classes.root}>
      <div
        className={classes.linearGenomeView}
        key={`view-${id}`}
        style={style}
      >
        <div
          className={classnames(classes.controls, classes.viewControls)}
          style={{ gridRow: 'scale-bar' }}
        >
          {model.hideControls ? null : (
            <>
              <IconButton
                onClick={model.closeView}
                className={classes.iconButton}
                title="close this view"
              >
                <Icon fontSize="small">close</Icon>
              </IconButton>
              <ToggleButton
                onClick={activateTrackSelector}
                title="select tracks"
                selected={
                  session.visibleDrawerWidget &&
                  session.visibleDrawerWidget.id ===
                    'hierarchicalTrackSelector' &&
                  session.visibleDrawerWidget.view.id === model.id
                }
                value="track_select"
                data_testid="track_select"
              >
                <Icon fontSize="small">line_style</Icon>
              </ToggleButton>
            </>
          )}
        </div>

        <Rubberband
          style={{
            gridColumn: 'blocks',
            gridRow: 'scale-bar',
          }}
          offsetPx={offsetPx}
          blocks={staticBlocks}
          bpPerPx={bpPerPx}
          model={model}
        >
          <ScaleBar
            height={scaleBarHeight}
            bpPerPx={bpPerPx}
            blocks={staticBlocks}
            offsetPx={offsetPx}
            horizontallyFlipped={model.horizontallyFlipped}
            width={model.viewingRegionWidth}
          />
        </Rubberband>

        <div
          className={classes.zoomControls}
          style={{
            right: 4,
            zIndex: 1000,
          }}
        >
          <ZoomControls model={model} controlsHeight={scaleBarHeight} />
        </div>
        {tracks.map(track => {
          const trackType = getTrackType(track.type)
          const ControlsComponent =
            trackType.ControlsReactComponent || TrackControls
          const RenderingComponent = trackType.ReactComponent || BlockBasedTrack
          return [
            <div
              className={classnames(classes.controls, classes.trackControls)}
              key={`controls:${track.id}`}
              style={{ gridRow: `track-${track.id}`, gridColumn: 'controls' }}
            >
              <ControlsComponent
                track={track}
                key={track.id}
                view={model}
                onConfigureClick={() =>
                  session.editConfiguration(track.configuration)
                }
                session={session}
              />
            </div>,
            <TrackRenderingContainer
              key={`track-rendering:${track.id}`}
              trackId={track.id}
              width={model.viewingRegionWidth}
              height={track.height}
            >
              <RenderingComponent
                model={track}
                session={session}
                offsetPx={offsetPx}
                bpPerPx={bpPerPx}
                blockState={{}}
                onHorizontalScroll={model.horizontalScroll}
              />
            </TrackRenderingContainer>,
            <TrackResizeHandle
              key={`handle:${track.id}`}
              trackId={track.id}
              onVerticalDrag={model.resizeTrack}
            />,
          ]
        })}
      </div>
    </div>
  )
}
LinearGenomeView.propTypes = {
  classes: ReactPropTypes.objectOf(ReactPropTypes.string).isRequired,
  model: PropTypes.objectOrObservableObject.isRequired,
}

export default withStyles(styles)(observer(LinearGenomeView))
