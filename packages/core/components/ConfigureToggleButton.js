import React from 'react'
import ReactPropTypes from 'prop-types'
import ToggleButton from '@material-ui/lab/ToggleButton'
import { withStyles, Icon } from '@material-ui/core'
import { observer, PropTypes } from 'mobx-react'

const styles = theme => ({
  button: {
    height: '32px',
    border: 'none',
  },
})

function ConfigureToggleButton(props) {
  const { model, session, classes, ...otherProps } = props
  return (
    <ToggleButton
      type="button"
      size="small"
      style={{ minWidth: 0 }}
      className={classes.button}
      selected={
        session.visibleDrawerWidget &&
        session.visibleDrawerWidget.id === 'configEditor' &&
        session.visibleDrawerWidget.target.configId ===
          model.configuration.configId
      }
      value="configure"
      {...otherProps}
    >
      <Icon fontSize="small">settings</Icon>
    </ToggleButton>
  )
}

ConfigureToggleButton.propTypes = {
  model: PropTypes.objectOrObservableObject.isRequired,
  session: PropTypes.objectOrObservableObject.isRequired,
  classes: ReactPropTypes.shape({ button: ReactPropTypes.string }).isRequired,
}
ConfigureToggleButton.defaultProps = {}

export default withStyles(styles)(observer(ConfigureToggleButton))
