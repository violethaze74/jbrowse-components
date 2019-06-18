import React from 'react'
import ToggleButton from '@material-ui/lab/ToggleButton'
import { Icon } from '@material-ui/core'
import { observer, PropTypes } from 'mobx-react'

function ConfigureToggleButton(props) {
  const { model, session, ...otherProps } = props
  return (
    <ToggleButton
      type="button"
      size="small"
      style={{ minWidth: 0 }}
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
}
ConfigureToggleButton.defaultProps = {}

export default observer(ConfigureToggleButton)
