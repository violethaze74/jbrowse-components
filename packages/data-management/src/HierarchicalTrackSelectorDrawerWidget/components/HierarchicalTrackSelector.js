import Fab from '@material-ui/core/Fab'
import Icon from '@material-ui/core/Icon'
import IconButton from '@material-ui/core/IconButton'
import InputAdornment from '@material-ui/core/InputAdornment'
import Menu from '@material-ui/core/Menu'
import MenuItem from '@material-ui/core/MenuItem'
import Paper from '@material-ui/core/Paper'
import Tab from '@material-ui/core/Tab'
import Tabs from '@material-ui/core/Tabs'
import { withStyles } from '@material-ui/core/styles'
import TextField from '@material-ui/core/TextField'
import Typography from '@material-ui/core/Typography'
import { PropTypes as MobxPropTypes } from 'mobx-react'
import { observer } from 'mobx-react-lite'
import propTypes from 'prop-types'
import React, { useState, useEffect } from 'react'
import { readConfObject } from '@gmod/jbrowse-core/configuration'
import { getContainingAssembly } from '@gmod/jbrowse-core/util/tracks'
import Contents from './Contents'

const styles = theme => ({
  root: {
    textAlign: 'left',
    padding: theme.spacing(1),
  },
  searchBox: {
    marginBottom: theme.spacing(2),
  },
  fab: {
    float: 'right',
    position: 'sticky',
    marginTop: theme.spacing(2),
    bottom: theme.spacing(2),
    right: theme.spacing(2),
  },
  connectionsPaper: {
    padding: theme.spacing(1),
    marginTop: theme.spacing(1),
    background: '#3b3b3b',
  },
  tabs: {
    marginBottom: theme.spacing(1),
  },
})

function HierarchicalTrackSelector(props) {
  const [anchorEl, setAnchorEl] = useState(null)
  const [assemblyIdx, setAssemblyIdx] = useState(0)
  const [hierarchy, setHierarchy] = useState(new Map())
  const [connectionHierarchies, setConnectionHierarchies] = useState(new Map())

  const { model, session, classes } = props

  const { trackConfigs } = session

  useEffect(() => {
    function generateHierarchy(trackConfigurations) {
      const newHierarchy = new Map()
      const newConnectionHierarchies = new Map()

      trackConfigurations.forEach(trackConf => {
        // console.log(trackConf)
        let thisHierarchy = newHierarchy
        if (trackConf.connectionName) {
          const { connectionName } = trackConf
          if (!newConnectionHierarchies.has(connectionName))
            newConnectionHierarchies.set(connectionName, new Map())
          thisHierarchy = newConnectionHierarchies.get(connectionName)
        }
        const categories = [...(readConfObject(trackConf, 'category') || [])]

        let currLevel = thisHierarchy
        for (let i = 0; i < categories.length; i += 1) {
          const category = categories[i]
          if (!currLevel.has(category)) currLevel.set(category, new Map())
          currLevel = currLevel.get(category)
        }
        currLevel.set(trackConf.configId, trackConf)
      })
      setHierarchy(newHierarchy)
      setConnectionHierarchies(newConnectionHierarchies)
    }

    generateHierarchy(trackConfigs)
  }, [trackConfigs])

  function handleTabChange(event, newIdx) {
    setAssemblyIdx(newIdx)
  }

  function handleFabClick(event) {
    setAnchorEl(event.currentTarget)
  }

  function handleFabClose() {
    setAnchorEl(null)
  }

  function handleInputChange(event) {
    model.setFilterText(event.target.value)
  }

  function addConnection() {
    handleFabClose()
    if (!session.drawerWidgets.get('addConnectionDrawerWidget'))
      session.addDrawerWidget(
        'AddConnectionDrawerWidget',
        'addConnectionDrawerWidget',
      )
    session.showDrawerWidget(
      session.drawerWidgets.get('addConnectionDrawerWidget'),
    )
  }

  function addTrack() {
    handleFabClose()
    session.addDrawerWidget('AddTrackDrawerWidget', 'addTrackDrawerWidget', {
      view: model.view.id,
    })
    session.showDrawerWidget(session.drawerWidgets.get('addTrackDrawerWidget'))
  }

  function filter(trackConfig) {
    if (!model.filterText) return true
    const name = readConfObject(trackConfig, 'name')
    return name.toLowerCase().includes(model.filterText.toLowerCase())
  }

  const { assemblyNames } = model
  const assemblyName = assemblyNames[assemblyIdx]
  function assemblyNameFilter(trackConfig) {
    return (
      readConfObject(getContainingAssembly(trackConfig), 'assemblyName') ===
      assemblyName
    )
  }
  const filterError =
    trackConfigs.filter(assemblyNameFilter) > 0 &&
    trackConfigs.filter(assemblyNameFilter).filter(filter).length === 0

  return (
    <div
      key={model.view.id}
      className={classes.root}
      data-testid="hierarchical_track_selector"
    >
      {assemblyNames.length > 1 ? (
        <Tabs
          className={classes.tabs}
          value={assemblyIdx}
          onChange={handleTabChange}
        >
          {assemblyNames.map(name => (
            <Tab key={name} label={name} />
          ))}
        </Tabs>
      ) : null}
      <TextField
        className={classes.searchBox}
        label="Filter Tracks"
        value={model.filterText}
        error={filterError}
        helperText={filterError ? 'No matches' : ''}
        onChange={handleInputChange}
        fullWidth
        InputProps={{
          endAdornment: (
            <InputAdornment position="end">
              <IconButton onClick={model.clearFilterText}>
                <Icon>clear</Icon>
              </IconButton>
            </InputAdornment>
          ),
        }}
      />
      <Contents
        model={model}
        session={session}
        hierarchy={hierarchy}
        filterPredicate={filter}
        assemblyName={assemblyName}
        top
      />
      {connectionHierarchies.size ? (
        <>
          <Typography variant="h5">Connections:</Typography>
          {Array.from(connectionHierarchies.keys()).map(connectionName => (
            <Paper
              key={connectionName}
              className={classes.connectionsPaper}
              elevation={8}
            >
              <Typography variant="h6" style={{ color: 'white' }}>
                {connectionName}
              </Typography>
              <Contents
                model={model}
                session={session}
                hierarchy={connectionHierarchies.get(connectionName)}
                filterPredicate={filter}
                connection={connectionName}
                assemblyName={assemblyName}
                top
              />
            </Paper>
          ))}
        </>
      ) : null}

      <Fab color="secondary" className={classes.fab} onClick={handleFabClick}>
        <Icon>add</Icon>
      </Fab>
      <Menu
        id="simple-menu"
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleFabClose}
      >
        <MenuItem onClick={addConnection}>Add connection</MenuItem>
        <MenuItem onClick={addTrack}>Add track</MenuItem>
      </Menu>
    </div>
  )
}

HierarchicalTrackSelector.propTypes = {
  classes: propTypes.objectOf(propTypes.string).isRequired,
  model: MobxPropTypes.observableObject.isRequired,
}

export default withStyles(styles)(observer(HierarchicalTrackSelector))
