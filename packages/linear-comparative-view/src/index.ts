import TrackType from '@gmod/jbrowse-core/pluggableElementTypes/TrackType'
import Plugin from '@gmod/jbrowse-core/Plugin'
import CalendarIcon from '@material-ui/icons/CalendarViewDay'
import PluginManager from '@gmod/jbrowse-core/PluginManager'

import {
  AbstractViewContainer,
  isAbstractMenuManager,
} from '@gmod/jbrowse-core/util'
import {
  configSchemaFactory as comparativeTrackConfigSchemaFactory,
  stateModelFactory as comparativeTrackStateModelFactory,
} from './LinearComparativeTrack'
import {
  configSchemaFactory as syntenyTrackConfigSchemaFactory,
  stateModelFactory as syntenyTrackStateModelFactory,
} from './LinearSyntenyTrack'

import LinearSyntenyRenderer, {
  configSchema as linearSyntenyRendererConfigSchema,
  ReactComponent as LinearSyntenyRendererReactComponent,
} from './LinearSyntenyRenderer'

export default class extends Plugin {
  name = 'LinearComparativeViewPlugin'

  install(pluginManager: PluginManager) {
    pluginManager.addViewType(() =>
      pluginManager.jbrequire(require('./LinearComparativeView')),
    )
    pluginManager.addViewType(() =>
      pluginManager.jbrequire(require('./LinearSyntenyView')),
    )
    pluginManager.addAdapterType(() =>
      pluginManager.jbrequire(require('./PairwiseLookup')),
    )
    pluginManager.addAdapterType(() =>
      pluginManager.jbrequire(require('./MCScanAnchorsAdapter')),
    )

    pluginManager.addTrackType(() => {
      const configSchema = comparativeTrackConfigSchemaFactory(pluginManager)
      return new TrackType({
        compatibleView: 'LinearComparativeView',
        name: 'LinearComparativeTrack',
        configSchema,
        stateModel: comparativeTrackStateModelFactory(
          pluginManager,
          configSchema,
        ),
      })
    })
    pluginManager.addTrackType(() => {
      const configSchema = syntenyTrackConfigSchemaFactory(pluginManager)
      return new TrackType({
        compatibleView: 'LinearSyntenyView',
        name: 'LinearSyntenyTrack',
        configSchema,
        stateModel: syntenyTrackStateModelFactory(pluginManager, configSchema),
      })
    })

    pluginManager.addRendererType(
      () =>
        new LinearSyntenyRenderer({
          name: 'LinearSyntenyRenderer',
          configSchema: linearSyntenyRendererConfigSchema,
          ReactComponent: LinearSyntenyRendererReactComponent,
        }),
    )
  }

  configure(pluginManager: PluginManager) {
    if (isAbstractMenuManager(pluginManager.rootModel)) {
      pluginManager.rootModel.appendToSubMenu(['File', 'Add'], {
        label: 'Linear synteny view',
        icon: CalendarIcon,
        onClick: (session: AbstractViewContainer) => {
          session.addView('LinearSyntenyView', {})
        },
      })
    }
  }
}
