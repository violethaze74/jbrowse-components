import DrawerWidgetType from '@gmod/jbrowse-core/pluggableElementTypes/DrawerWidgetType'
import BoxRendererType from '@gmod/jbrowse-core/pluggableElementTypes/renderers/BoxRendererType'
import Plugin from '@gmod/jbrowse-core/Plugin'
import { lazy } from 'react'
import {
  configSchema as svgFeatureRendererConfigSchema,
  ReactComponent as SvgFeatureRendererReactComponent,
} from './SvgFeatureRenderer'

import {
  configSchema as featureDetailConfigSchema,
  ReactComponent as FeatureDetailReactComponent,
  stateModel as featureDetailStateModel,
} from './FeatureDetail'

export default class extends Plugin {
  install(pluginManager) {
    pluginManager.addRendererType(
      () =>
        new BoxRendererType({
          name: 'SvgFeatureRenderer',
          ReactComponent: SvgFeatureRendererReactComponent,
          configSchema: svgFeatureRendererConfigSchema,
        }),
    )

    pluginManager.addDrawerWidgetType(
      () =>
        new DrawerWidgetType({
          name: 'FeatureDrawerWidget',
          heading: 'Feature Details',
          configSchema: featureDetailConfigSchema,
          stateModel: featureDetailStateModel,
          LazyReactComponent: lazy(() => FeatureDetailReactComponent),
        }),
    )

    pluginManager.registerAction('feature', 'click', (session, feature) => {
      if (!feature) {
        session.clearSelection()
        return
      }
      const drawerWidgetId = `feature-${feature.id()}`
      if (!session.drawerWidgets.get(drawerWidgetId))
        session.addDrawerWidget('FeatureDrawerWidget', drawerWidgetId)
      const featureWidget = session.drawerWidgets.get(drawerWidgetId)
      featureWidget.setFeatureData(feature.data)
      session.showDrawerWidget(featureWidget.id)
      session.setSelection(feature)
    })

    pluginManager.registerAction(
      'feature',
      'mouseenter',
      (session, feature) => {
        if (!feature) {
          session.clearHover()
          return
        }
        session.setHover(feature)
      },
    )

    pluginManager.registerAction('feature', 'mouseleave', session => {
      session.clearHover()
    })
  }
}
