import React from 'react'
import { observer } from 'mobx-react'
import Typography from '@material-ui/core/Typography'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function TrackBlurb(props: { model: any }) {
  const { model } = props
  return (
    <div
      data-testid={`blurb-${model.sortedBy}`}
      style={{ backgroundColor: 'white' }}
    >
      <Typography color="secondary" variant="caption">
        {model.sortedBy
          ? `Sorted by ${model.sortedBy.toLowerCase()} at ${
              model.sortedByRefName
            }:${model.sortedByPosition}`
          : null}
      </Typography>
    </div>
  )
}
export default observer(TrackBlurb)
