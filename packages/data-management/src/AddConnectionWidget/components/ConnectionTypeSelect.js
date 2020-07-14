import IconButton from '@material-ui/core/IconButton'
import MenuItem from '@material-ui/core/MenuItem'
import TextField from '@material-ui/core/TextField'
import PropTypes from 'prop-types'
import React from 'react'
import OpenInNewIcon from '@material-ui/icons/OpenInNew'

function ConnectionTypeSelect(props) {
  const {
    connectionTypeChoices,
    connectionType,
    setConnectionType,
    assemblyNameChoices,
    assemblyName,
    setAssemblyName,
  } = props

  function handleChange(event) {
    setConnectionType(
      connectionTypeChoices.find(
        connectionTypeChoice =>
          connectionTypeChoice.name === event.target.value,
      ),
    )
  }

  return (
    <form autoComplete="off">
      <TextField
        value={assemblyName}
        label="assemblyName"
        helperText="Assembly to which the track will be added"
        select
        fullWidth
        onChange={event => setAssemblyName(event.target.value)}
        inputProps={{ 'data-testid': 'assemblyNameSelect' }}
      >
        {assemblyNameChoices.map(assemblyNameChoice => (
          <MenuItem key={assemblyNameChoice} value={assemblyNameChoice}>
            {assemblyNameChoice}
          </MenuItem>
        ))}
      </TextField>
      <TextField
        value={connectionType.name || ''}
        label="connectionType"
        helperText={
          connectionType.description ? (
            <>
              {connectionType.description}
              {connectionType.url ? (
                <IconButton
                  href={connectionType.url}
                  rel="noopener noreferrer"
                  target="_blank"
                  color="secondary"
                >
                  <OpenInNewIcon />
                </IconButton>
              ) : null}
            </>
          ) : null
        }
        select
        fullWidth
        onChange={handleChange}
      >
        {connectionTypeChoices.map(connectionTypeChoice => (
          <MenuItem
            key={connectionTypeChoice.name}
            value={connectionTypeChoice.name}
          >
            {connectionTypeChoice.displayName || connectionTypeChoice.name}
          </MenuItem>
        ))}
      </TextField>
    </form>
  )
}

ConnectionTypeSelect.propTypes = {
  connectionTypeChoices: PropTypes.arrayOf(
    PropTypes.shape({
      name: PropTypes.string,
      description: PropTypes.string,
      url: PropTypes.string,
    }),
  ).isRequired,
  connectionType: PropTypes.shape({
    name: PropTypes.string,
    description: PropTypes.string,
    url: PropTypes.string,
  }).isRequired,
  setConnectionType: PropTypes.func.isRequired,
  assemblyNameChoices: PropTypes.arrayOf(PropTypes.string).isRequired,
  assemblyName: PropTypes.string.isRequired,
  setAssemblyName: PropTypes.func.isRequired,
}

export default ConnectionTypeSelect
