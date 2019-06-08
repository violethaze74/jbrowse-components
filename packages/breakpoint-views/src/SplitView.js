import ReactComponentM from './components/SplitView'
import modelM from './models'

export default pluginManager => {
  const { jbrequire } = pluginManager
  const ReactComponent = jbrequire(ReactComponentM)
  const stateModel = jbrequire(modelM)
  const ViewType = jbrequire(
    '@gmod/jbrowse-core/pluggableElementTypes/ViewType',
  )
  const { ConfigurationSchema } = jbrequire('@gmod/jbrowse-core/configuration')

  const configSchema = ConfigurationSchema(
    'SplitBreakpointView',
    {},
    { explicitlyTyped: true },
  )

  return new ViewType({
    name: 'SplitBreakpointView',
    stateModel,
    configSchema,
    ReactComponent,
  })
}
