/* eslint-disable react/prop-types */
import React, { useState } from 'react'
import copy from 'copy-to-clipboard'

// eslint-disable-next-line import/no-unresolved
import Layout from '@theme/Layout'
// eslint-disable-next-line import/no-unresolved
import useDocusaurusContext from '@docusaurus/useDocusaurusContext'

import {
  Button,
  Card,
  CardActions,
  CardContent,
  Link,
  Typography,
  makeStyles,
} from '@material-ui/core'

import PersonIcon from '@material-ui/icons/Person'
import AccountBalanceIcon from '@material-ui/icons/AccountBalance'
import GitHubIcon from '@material-ui/icons/GitHub'
import AssignmentIcon from '@material-ui/icons/Assignment'
import AssignmentTurnedInIcon from '@material-ui/icons/AssignmentTurnedIn'

// eslint-disable-next-line import/no-unresolved
import { plugins } from '../../plugins.json'

const useStyles = makeStyles(theme => ({
  button: {
    textTransform: 'none',
  },
  section: {
    marginTop: '24px',
    marginBottom: '32px',
  },

  container: {
    display: 'flex',
    [theme.breakpoints.down('md')]: {
      flexDirection: 'column',
    },
    justifyContent: 'center',
    alignItems: 'center',
  },

  body: {
    [theme.breakpoints.down('md')]: {
      margin: '0.5em',
    },
    margin: '5em',
  },
  cardContent: {
    display: 'flex',
    [theme.breakpoints.down('md')]: {
      flexDirection: 'column',
    },
  },

  flexDetails: {
    display: 'flex',
    [theme.breakpoints.down('md')]: {
      flexDirection: 'column',
    },
  },
  flexDetailChild: {
    paddingLeft: '1em',
    [theme.breakpoints.down('md')]: {
      paddingLeft: 0,
    },
  },

  topLinks: {
    margin: '0 auto',
    display: 'flex',
    alignItems: 'space-between',
    justifyContent: 'center',
    [theme.breakpoints.down('md')]: {
      flexDirection: 'column',
    },
  },

  card: {
    margin: '1em auto',
  },

  cardMedia: {
    maxWidth: 400,
  },

  icon: {
    height: '1em',
    marginRight: '0.5em',
  },

  topButton: {
    margin: '1em',
  },

  closeButton: {
    color: '#fff',
    position: 'absolute',
    top: 5,
    right: 0,
  },
  spacer: { flex: 1 },

  dataField: {
    display: 'flex',
    alignItems: 'center',
    margin: '0.4em 0em',
  },

  dialogTitleBox: {
    backgroundColor: theme.palette.primary.main,
    color: '#fff',
    textAlign: 'center',
  },
}))

function TopDocumentation() {
  const [showMoreInfo, setShowMoreInfo] = useState(false)

  return (
    <div style={{ width: '75%' }}>
      <Typography>
        This page contains a list of JBrowse 2 plugins that are available for
        use. Plugins can add custom data adapters, track types, or other
        features.
      </Typography>
      <Typography style={{ marginTop: '0.2em' }}>
        The app has a plugin store (similar to this page) built-into the app
        (File-&gt;Plugin store), so both admin or non-admin users can
        interactively add the plugin from inside the app.
      </Typography>

      {showMoreInfo ? (
        <>
          <Typography>
            As noted above, user's can use the File-&gt;Plugin store. Non-admin
            users get the plugin added to their session, while if the
            admin-server is used, it adds it directly to the config file. Admin
            users can also use the "Show configuration" button to get a snippet
            that they can paste in their config.json file. For example a
            config.json plugin section might look like this:
          </Typography>
          <pre>
            <code>
              {`
          {
            plugins: [
              {
                "name": "MsaView",
                "url": "https://unpkg.com/jbrowse-plugin-msaview/dist/jbrowse-plugin-msaview.umd.production.min.js"
              }
            ]
          }`}
            </code>
          </pre>
          <Typography>
            We welcome developers who want to create a new JBrowse 2 plugin. The
            primary resource for getting started creating a new plugin is the{' '}
            <Link
              href="https://github.com/GMOD/jbrowse-plugin-template"
              target="_blank"
              rel="noopener"
            >
              plugin template
            </Link>{' '}
            and also see the{' '}
            <Link
              href="https://jbrowse.org/jb2/docs/developer_guide"
              target="_blank"
              rel="noopener"
            >
              developer guide
            </Link>
            .
          </Typography>
          <Typography>
            If you build a plugin that you would like to be featured in this
            store, please follow the instructions found{' '}
            <Link
              href="https://github.com/GMOD/jbrowse-plugin-list"
              target="_blank"
              rel="noopener"
            >
              here
            </Link>
            .
          </Typography>
        </>
      ) : null}
      <Button
        onClick={() => setShowMoreInfo(!showMoreInfo)}
        variant="outlined"
        size="small"
        color="primary"
      >
        {!showMoreInfo ? 'Click for more info...' : 'Hide more info'}
      </Button>
    </div>
  )
}

function PluginCard(props) {
  const classes = useStyles()
  const { plugin } = props

  const [showConfig, setShowConfig] = useState(false)

  return (
    <Card variant="outlined" key={plugin.name} className={classes.card}>
      <CardContent>
        <div className={classes.cardContent}>
          <div>
            <div className={classes.dataField}>
              <Typography variant="h6">{plugin.name}</Typography>
            </div>
            <div className={classes.flexDetails}>
              <div className={classes.flexDetailChild}>
                <PersonIcon className={classes.icon} />
                <Typography display="inline">
                  {plugin.authors.join(', ')}
                </Typography>
              </div>
              <div className={classes.flexDetailChild}>
                <AccountBalanceIcon className={classes.icon} />
                <Typography display="inline">
                  {plugin.license === 'NONE' ? 'No license' : plugin.license}
                </Typography>
              </div>
              <div className={classes.flexDetailChild}>
                <GitHubIcon className={classes.icon} />
                <Link href={plugin.location} target="_blank" rel="noopener">
                  {plugin.location}
                </Link>
              </div>
            </div>
            <Typography>{plugin.description}</Typography>
          </div>
          <div className={classes.spacer} />
          {plugin.image ? (
            <img
              src={plugin.image}
              title={plugin.name}
              className={classes.cardMedia}
            />
          ) : null}
        </div>
      </CardContent>
      <CardActions>
        <Button
          color="primary"
          variant="contained"
          disableRipple
          size="small"
          style={{ marginLeft: '1em' }}
          onClick={() => setShowConfig(!showConfig)}
        >
          {showConfig ? 'Hide configuration' : 'Show configuration'}
        </Button>
      </CardActions>
      {showConfig ? <ConfigBlock plugin={plugin} /> : null}
    </Card>
  )
}

function ConfigBlock(props) {
  const { plugin } = props
  const [clickedCopy, setClickedCopy] = useState(false)
  const config = JSON.stringify({ name: plugin.name, url: plugin.url }, 0, 4)

  return (
    <CardContent>
      <pre>
        <code>{config}</code>
      </pre>
      <Button
        color="primary"
        variant="contained"
        disableRipple
        size="small"
        startIcon={
          clickedCopy ? <AssignmentTurnedInIcon /> : <AssignmentIcon />
        }
        onClick={() => {
          copy(configString)
          setClickedCopy(true)
          setTimeout(() => setClickedCopy(false), 1000)
        }}
      >
        {clickedCopy ? 'Copied!' : 'Copy'}
      </Button>
    </CardContent>
  )
}

function PluginStore() {
  const context = useDocusaurusContext()
  const { siteConfig = {} } = context
  const classes = useStyles()

  return (
    <Layout title={`${siteConfig.title}`}>
      <div className={classes.body}>
        <div style={{ flexBasis: '50%' }}>
          <h1 style={{ textAlign: 'center' }}>JBrowse 2 Plugin Store</h1>
        </div>
        <TopDocumentation />

        {plugins.map(plugin => (
          <PluginCard plugin={plugin} key={plugin.name} />
        ))}
      </div>
    </Layout>
  )
}

const configExample = `{
  "configuration": {
    /* global configs here */
  },
  "assemblies": [
    /* list of assembly configurations */
  ],
  "tracks": [
    /* array of tracks being loaded */
  ],
  "defaultSession": {
    /* optional default session */
  },
  "plugins": [
    {
      "name": "Msaview",
      "url": "https://unpkg.com/jbrowse-plugin-msaview/dist/jbrowse-plugin-msaview.umd.production.min.js"
    }
  ]
}`

export default PluginStore
