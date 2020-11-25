import React, { useState } from 'react'
import { makeStyles } from '@material-ui/core/styles'
import Button from '@material-ui/core/Button'
import TextField from '@material-ui/core/TextField'
import Typography from '@material-ui/core/Typography'
import Dialog from '@material-ui/core/Dialog'
import MenuItem from '@material-ui/core/MenuItem'
import DialogContent from '@material-ui/core/DialogContent'
import DialogTitle from '@material-ui/core/DialogTitle'
import IconButton from '@material-ui/core/IconButton'
import CloseIcon from '@material-ui/icons/Close'
import { AnyConfigurationModel } from '@jbrowse/core/configuration/configurationSchema'

const useStyles = makeStyles(theme => ({
  root: {
    width: 600,
  },
  closeButton: {
    position: 'absolute',
    right: theme.spacing(1),
    top: theme.spacing(1),
    color: theme.palette.grey[500],
  },
  formFields: {
    width: '20%',
    paddingRight: 2,
  },
}))

export default function ColorByTagDlg(props: {
  model: AnyConfigurationModel
  handleClose: () => void
}) {
  const classes = useStyles()
  const { model, handleClose } = props
  const [tag, setTag] = useState('')
  const [customName, setCustomName] = useState('')
  const [defaultColor, setDefaultColor] = useState('')
  const uniqueTags = new Set()
  const presetTags = new Set(['', 'HP', 'XS', 'TS', 'YC'])
  const colors = ['red', 'yellow', 'blue', 'green', 'orange'] // randomly selected, need to change

  // there should be a better way of accessing this
  model.displays[0].features.submaps[0].forEach(feature =>
    feature.tags().forEach(featureTag => {
      uniqueTags.add(featureTag)
    }),
  )

  return (
    <Dialog
      open
      onClose={handleClose}
      aria-labelledby="alert-dialog-title"
      aria-describedby="alert-dialog-description"
    >
      <DialogTitle id="alert-dialog-title">
        Color by tag
        <IconButton
          aria-label="close"
          className={classes.closeButton}
          onClick={handleClose}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent>
        <Typography>Set the tag to color by</Typography>
        <div className={classes.root}>
          <form>
            <TextField
              id="standard-select-currency"
              select
              value={tag}
              onChange={event => {
                setTag(event.target.value)
              }}
              className={classes.formFields}
            >
              <MenuItem value="" />
              {Array.from(uniqueTags).map(uniqueTag => (
                <MenuItem key={uniqueTag} value={uniqueTag}>
                  {uniqueTag}
                </MenuItem>
              ))}
              <MenuItem value="customTag"> Custom Tag </MenuItem>
            </TextField>
            {!presetTags.has(tag) && tag === 'customTag' && (
              <TextField
                id="custom-name"
                onBlur={event => {
                  setCustomName(event.target.value)
                }}
                placeholder="Set Custom Name"
                className={classes.formFields}
              />
            )}
            {/* confusing, need a way to tell user to select color here */}
            {!presetTags.has(tag) && (
              <TextField
                id="default-color"
                select
                value={defaultColor}
                onChange={event => {
                  setDefaultColor(event.target.value)
                }}
                className={classes.formFields}
              >
                <MenuItem value="" disabled selected>
                  Select default color
                </MenuItem>
                {colors.map(color => (
                  <MenuItem key={color} value={color}>
                    {color}
                  </MenuItem>
                ))}
              </TextField>
            )}
            {/* TODOCOLOR: add value buttons */}
            <Button
              onClick={() => {
                const display = model.displays[0]
                ;(display.PileupDisplay || display).setColorScheme({
                  type: 'tag',
                  tag,
                })
                handleClose()
              }}
            >
              Submit
            </Button>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  )
}
