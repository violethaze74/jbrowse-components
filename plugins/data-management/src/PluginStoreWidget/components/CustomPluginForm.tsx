import React, { useState } from 'react'
import { observer } from 'mobx-react'
import { getSession } from '@jbrowse/core/util'
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  Button,
  IconButton,
  makeStyles,
} from '@material-ui/core'
import CloseIcon from '@material-ui/icons/Close'

import { PluginStoreModel } from '../model'

const useStyles = makeStyles(() => ({
  closeDialog: {
    position: 'absolute',
    right: 0,
    top: 0,
  },
  dialogContainer: {
    margin: 15,
    display: 'flex',
    flexDirection: 'column',
  },
}))

function CustomPluginForm({
  open,
  onClose,
  model,
}: {
  open: boolean
  onClose: Function
  model: PluginStoreModel
}) {
  const classes = useStyles()
  const [name, setName] = useState('')
  const [url, setUrl] = useState('')
  const { jbrowse } = getSession(model)

  return (
    <Dialog open={open} onClose={() => onClose(false)}>
      <DialogTitle>
        Add custom plugin
        <IconButton
          className={classes.closeDialog}
          aria-label="close-dialog"
          onClick={() => onClose(false)}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent>
        <TextField
          id="name-input"
          name="name"
          label="Plugin name"
          variant="outlined"
          value={name}
          onChange={event => setName(event.target.value)}
          multiline
        />
        <TextField
          id="url-input"
          name="url"
          label="Plugin URL"
          variant="outlined"
          value={url}
          onChange={event => setUrl(event.target.value)}
          multiline
        />
      </DialogContent>
      <DialogActions>
        <Button
          variant="contained"
          color="secondary"
          style={{ marginTop: '1.5rem' }}
          onClick={() => onClose()}
        >
          Cancel
        </Button>
        <Button
          variant="contained"
          color="primary"
          style={{ marginTop: '1.5rem' }}
          onClick={() => {
            jbrowse.addPlugin({ name, url })
            onClose()
          }}
        >
          Add plugin
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default observer(CustomPluginForm)
