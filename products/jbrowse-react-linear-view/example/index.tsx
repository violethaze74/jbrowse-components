/* eslint-disable import/no-extraneous-dependencies */
import 'react-app-polyfill/ie11'
import * as React from 'react'
import * as ReactDOM from 'react-dom'
import {
  createViewState,
  createJBrowseTheme,
  JBrowseLinearView,
  ThemeProvider,
} from '..'
import { exampleAssembly, exampleSession, exampleTracks } from './examples'

const theme = createJBrowseTheme()

function View() {
  const state = createViewState({
    assembly: exampleAssembly,
    tracks: exampleTracks,
    defaultSession: exampleSession,
    location: 'ctgA:1105..1221',
    onChange: patch => {
      console.log('patch', patch)
    },
  })
  return (
    <ThemeProvider theme={theme}>
      <JBrowseLinearView viewState={state} />
    </ThemeProvider>
  )
}

const App = () => {
  return (
    <div>
      <View />
    </div>
  )
}

ReactDOM.render(<App />, document.getElementById('root'))
