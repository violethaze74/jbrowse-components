import AdapterType from '@gmod/jbrowse-core/pluggableElementTypes/AdapterType'
import DrawerWidgetType from '@gmod/jbrowse-core/pluggableElementTypes/DrawerWidgetType'
import TrackType from '@gmod/jbrowse-core/pluggableElementTypes/TrackType'
import Plugin from '@gmod/jbrowse-core/Plugin'
import { lazy } from 'react'
import {
  configSchema as alignmentsFeatureDetailConfigSchema,
  ReactComponent as AlignmentsFeatureDetailReactComponent,
  stateModel as alignmentsFeatureDetailStateModel,
} from './AlignmentsFeatureDetail'
import {
  configSchemaFactory as alignmentsTrackConfigSchemaFactory,
  modelFactory as alignmentsTrackModelFactory,
  ControlsReactComponent as AlignmentsTrackControlsReactComponent,
} from './AlignmentsTrack'
import {
  AdapterClass as BamAdapterClass,
  configSchema as bamAdapterConfigSchema,
} from './BamAdapter'
import PileupRenderer, {
  configSchema as pileupRendererConfigSchema,
  ReactComponent as PileupRendererReactComponent,
} from './PileupRenderer'

export default class extends Plugin {
  install(pluginManager) {
    pluginManager.addTrackType(() => {
      const configSchema = alignmentsTrackConfigSchemaFactory(pluginManager)
      return new TrackType({
        name: 'AlignmentsTrack',
        configSchema,
        stateModel: alignmentsTrackModelFactory(configSchema),
        ControlsReactComponent: AlignmentsTrackControlsReactComponent,
      })
    })

    pluginManager.addDrawerWidgetType(
      () =>
        new DrawerWidgetType({
          name: 'AlignmentsFeatureDrawerWidget',
          heading: 'Feature Details',
          configSchema: alignmentsFeatureDetailConfigSchema,
          stateModel: alignmentsFeatureDetailStateModel,
          LazyReactComponent: lazy(() => AlignmentsFeatureDetailReactComponent),
        }),
    )

    pluginManager.addAdapterType(
      () =>
        new AdapterType({
          name: 'BamAdapter',
          configSchema: bamAdapterConfigSchema,
          AdapterClass: BamAdapterClass,
        }),
    )

    pluginManager.addRendererType(
      () =>
        new PileupRenderer({
          name: 'PileupRenderer',
          ReactComponent: PileupRendererReactComponent,
          configSchema: pileupRendererConfigSchema,
        }),
    )

    pluginManager.registerAction(
      'alignmentsFeature',
      'click',
      (session, feature) => {
        if (!feature) {
          session.clearSelection()
          return
        }
        const drawerWidgetId = `alignmentsFeature-${feature.id()}`
        if (!session.drawerWidgets.get(drawerWidgetId))
          session.addDrawerWidget(
            'AlignmentsFeatureDrawerWidget',
            drawerWidgetId,
          )
        const featureWidget = session.drawerWidgets.get(drawerWidgetId)
        featureWidget.setFeatureData(feature.data)
        session.showDrawerWidget(featureWidget.id)
        session.setSelection(feature)
      },
    )
  }
}
