import Paper from '@material-ui/core/Paper'
import { withStyles } from '@material-ui/core/styles'
import Table from '@material-ui/core/Table'
import TableBody from '@material-ui/core/TableBody'
import TableCell from '@material-ui/core/TableCell'
import TableHead from '@material-ui/core/TableHead'
import TableRow from '@material-ui/core/TableRow'
import { observer, PropTypes as MobxPropTypes } from 'mobx-react'
import PropTypes from 'prop-types'
import React from 'react'

const DataCell = withStyles({
  valueCell: {
    wordWrap: 'break-word',
  },
})(({ classes, value }) => {
  let child = String(value)
  if (String(value) === '[object Object]') child = <FeatureTable data={value} />
  if (value === null || value === undefined) child = null
  if (Array.isArray(value)) child = value.join(', ')

  return (
    <TableCell className={classes.valueCell} padding="none">
      {child}
    </TableCell>
  )
})

const FeatureTable = withStyles({
  table: {
    tableLayout: 'fixed',
    width: '100%',
  },
})(({ classes, data, header }) => {
  return (
    <Table className={classes.table} size="small">
      {header ? (
        <TableHead>
          <TableRow>
            <TableCell>Data</TableCell>
            <TableCell />
          </TableRow>
        </TableHead>
      ) : null}
      <TableBody>
        {Object.keys(data).map(key => (
          <TableRow key={key}>
            <TableCell component="th" scope="row">
              {key}
            </TableCell>
            <DataCell value={data[key]} />
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
})

const FeatureDetails = withStyles(theme => ({
  root: {
    margin: theme.spacing(),
    marginTop: theme.spacing(3),
  },
}))(({ model, classes }) => {
  return (
    <Paper className={classes.root}>
      <FeatureTable data={model.featureData} header="Data" />
    </Paper>
  )
})

FeatureDetails.propTypes = {
  model: MobxPropTypes.observableObject.isRequired,
  classes: PropTypes.objectOf(PropTypes.string).isRequired,
}

export default observer(FeatureDetails)
