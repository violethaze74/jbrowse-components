import React, { useEffect, useState, Suspense } from 'react'
import { observer } from 'mobx-react'
import { CssBaseline, ThemeProvider } from '@material-ui/core'
import { getConf } from '@jbrowse/core/configuration'
import { App, createJBrowseTheme } from '@jbrowse/core/ui'
import PluginManager from '@jbrowse/core/PluginManager'
import { AssemblyManager } from '@jbrowse/plugin-data-management'
import deepmerge from 'deepmerge'

// locals
import { RootModel } from './rootModel'

const JBrowse = observer(
  ({ pluginManager, mode }: { mode: string; pluginManager: PluginManager }) => {
    const { rootModel } = pluginManager

    return rootModel ? (
      <JBrowseNonNullRoot mode={mode} rootModel={rootModel as RootModel} />
    ) : null
  },
)

const JBrowseNonNullRoot = observer(
  ({ rootModel, mode }: { mode: string; rootModel: RootModel }) => {
    const [firstLoad, setFirstLoad] = useState(true)
    const { session, jbrowse, error, isAssemblyEditing, setAssemblyEditing } =
      rootModel

    useEffect(() => {
      if (firstLoad && session) {
        setFirstLoad(false)
      }
    }, [firstLoad, session])

    if (error) {
      throw error
    }

    const theme = getConf(jbrowse, 'theme')

    const colorTheme = React.useMemo(
      () => ({
        palette: {
          type: mode,
        },
      }),
      [mode],
    )

    return (
      // @ts-ignore
      <ThemeProvider theme={createJBrowseTheme(deepmerge(theme, colorTheme))}>
        <CssBaseline />
        {session ? (
          <>
            <App session={session} />
            <Suspense fallback={<div />}>
              {isAssemblyEditing ? (
                <AssemblyManager
                  rootModel={rootModel}
                  onClose={() => {
                    setAssemblyEditing(false)
                  }}
                />
              ) : null}
            </Suspense>
          </>
        ) : (
          <div>No session</div>
        )}
      </ThemeProvider>
    )
  },
)

export default JBrowse
