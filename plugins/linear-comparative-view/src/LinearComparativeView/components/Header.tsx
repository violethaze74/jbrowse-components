import React from 'react'
import { getEnv } from 'mobx-state-tree'
import { getSession } from '@jbrowse/core/util'

import LeakAddIcon from '@material-ui/icons/LeakAdd'
import LeakRemoveIcon from '@material-ui/icons/LeakRemove'
import LinkIcon from '@material-ui/icons/Link'
import ArrowDropUpIcon from '@material-ui/icons/ArrowDropUp'
import ArrowDropDownIcon from '@material-ui/icons/ArrowDropDown'
import LinkOffIcon from '@material-ui/icons/LinkOff'
import LocationSearchingIcon from '@material-ui/icons/LocationSearching'
import LocationDisabledIcon from '@material-ui/icons/LocationDisabled'
import IconButton from '@material-ui/core/IconButton'
import FormGroup from '@material-ui/core/FormGroup'
import { withSize } from 'react-sizeme'
import { makeStyles, alpha, useTheme } from '@material-ui/core/styles'
import { observer } from 'mobx-react'
import RefNameAutocomplete from '@jbrowse/core/ui/RefNameAutocomplete'
import { LinearComparativeViewModel } from '../model'

const WIDGET_HEIGHT = 32
const SPACING = 7
const useStyles = makeStyles(theme => ({
  headerBar: {
    gridArea: '1/1/auto/span 2',
    display: 'flex',
  },
  headerForm: {
    flexWrap: 'nowrap',
    marginRight: 7,
  },
  headerRefName: {
    minWidth: 100,
  },
  spacer: {
    flexGrow: 1,
  },
  emphasis: {
    background: theme.palette.secondary.main,
    padding: theme.spacing(1),
  },
  hovered: {
    background: theme.palette.secondary.light,
  },
  displayName: {
    background: theme.palette.secondary.main,
    paddingTop: 3,
    paddingLeft: theme.spacing(1),
    paddingRight: theme.spacing(1),
  },
  inputBase: {
    color: theme.palette.secondary.contrastText,
  },
  inputRoot: {
    '&:hover': {
      backgroundColor: theme.palette.secondary.light,
    },
  },
  inputFocused: {
    borderColor: theme.palette.primary.main,
    backgroundColor: theme.palette.secondary.light,
  },
}))

const InteractWithSquiggles = observer(
  ({ model }: { model: LinearComparativeViewModel }) => {
    return (
      <IconButton
        onClick={model.toggleInteract}
        title="Toggle interacting with the overlay"
      >
        {model.interactToggled ? (
          <LocationSearchingIcon />
        ) : (
          <LocationDisabledIcon />
        )}
      </IconButton>
    )
  },
)

const LinkViews = observer(
  ({ model }: { model: LinearComparativeViewModel }) => {
    return (
      <IconButton
        onClick={model.toggleLinkViews}
        title="Toggle linked scrolls and behavior across views"
      >
        {model.linkViews ? (
          <LinkIcon color="secondary" />
        ) : (
          <LinkOffIcon color="secondary" />
        )}
      </IconButton>
    )
  },
)

const Sync = observer(({ model }: { model: LinearComparativeViewModel }) => {
  return (
    <IconButton
      onClick={model.toggleIntraviewLinks}
      title="Toggle rendering intraview links"
    >
      {model.showIntraviewLinks ? (
        <LeakAddIcon color="secondary" />
      ) : (
        <LeakRemoveIcon color="secondary" />
      )}
    </IconButton>
  )
})

const Header = observer(
  ({
    model,
    size,
  }: {
    model: LinearComparativeViewModel
    size: { height: number }
  }) => {
    const classes = useStyles()
    model.setHeaderHeight(size.height)
    const theme = useTheme()
    const session = getSession(model)
    // const { pluginManager } = getEnv(session)
    const { assemblyManager } = session
    const { views } = model
    // console.log('===================')
    // console.log(model.currentView)
    // console.log(views[model.currentView])
    const { coarseDynamicBlocks: contentBlocks, displayedRegions } = views[
      model.currentView
    ]
    const { assemblyName, refName } = contentBlocks[0] || { refName: '' }
    const assembly = assemblyName && assemblyManager.get(assemblyName)
    const regions = (assembly && assembly.regions) || []
    // console.log(displayedRegions)
    // console.log(contentBlocks)
    // console.log('===================')
    return (
      <div className={classes.headerBar}>
        <LinkViews model={model} />
        <InteractWithSquiggles model={model} />
        <Sync model={model} />
        <div>
          <IconButton
            onClick={() => model.setCurrentView(0)}
            disabled={model.currentView === 0}
            title="set top view as current view"
          >
            <ArrowDropUpIcon color="secondary" />
          </IconButton>
          <IconButton
            onClick={() => model.setCurrentView(1)}
            disabled={model.currentView === 1}
            title="set bottom view as current view"
          >
            <ArrowDropDownIcon color="secondary" />
          </IconButton>
        </div>
        <FormGroup row className={classes.headerForm}>
          <RefNameAutocomplete
            onSelect={() =>
              console.log('I selected a region from these regions', regions)
            }
            assemblyName={assemblyName}
            value={displayedRegions.length > 1 ? '' : refName}
            model={model}
            TextFieldProps={{
              variant: 'outlined',
              className: classes.headerRefName,
              style: { margin: SPACING, minWidth: '175px' },
              InputProps: {
                style: {
                  padding: 0,
                  height: WIDGET_HEIGHT,
                  background: alpha(theme.palette.background.paper, 0.8),
                },
              },
            }}
          />
        </FormGroup>
        <div className={classes.spacer} />
      </div>
    )
  },
)

export default withSize({ monitorHeight: true })(Header)
