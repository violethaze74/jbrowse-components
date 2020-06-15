import { ConfigurationReference } from '@gmod/jbrowse-core/configuration'
import { getParentRenderProps } from '@gmod/jbrowse-core/util/tracks'
import { getSession } from '@gmod/jbrowse-core/util'
import {
  blockBasedTrackModel,
  BlockBasedTrack,
} from '@gmod/jbrowse-plugin-linear-genome-view'
import FilterListIcon from '@material-ui/icons/FilterList'
import { types } from 'mobx-state-tree'
import MenuOpenIcon from '@material-ui/icons/MenuOpen'

export default function stateModelFactory(configSchema) {
  return types
    .compose(
      'GDCTrack',
      blockBasedTrackModel,
      types.model({
        type: types.literal('GDCTrack'),
        configuration: ConfigurationReference(configSchema),
        height: 100,
      }),
    )

    .actions(self => ({
      openFilterConfig() {
        const session = getSession(self)
        const editor = session.addDrawerWidget(
          'GDCFilterDrawerWidget',
          'gdcFilter',
          { target: self.configuration },
        )
        session.showDrawerWidget(editor)
      },

      selectFeature(feature) {
        const session = getSession(self)
        const featureWidget = session.addDrawerWidget(
          'GDCFeatureDrawerWidget',
          'gdcFeature',
          { featureData: feature.toJSON() },
        )
        session.showDrawerWidget(featureWidget)
        session.setSelection(feature)
      },

      selectFeatureView(feature) {
        const session = getSession(self)
        session.setSelection(feature)
        session.addView('GDCFeatureView', { featureData: feature.toJSON() })
      },
    }))

    .views(self => ({
      get renderProps() {
        return {
          ...self.composedRenderProps,
          ...getParentRenderProps(self),
          config: self.configuration.renderer,
        }
      },

      get rendererTypeName() {
        return self.configuration.renderer.type
      },

      get contextMenuOptions() {
        return self.contextMenuFeature
          ? [
              {
                label: 'Open feature details in a drawer',
                icon: MenuOpenIcon,
                onClick: () => {
                  if (self.contextMenuFeature) {
                    self.selectFeature(self.contextMenuFeature)
                  }
                },
              },
              {
                label: 'Open feature details in a view',
                icon: MenuOpenIcon,
                onClick: () => {
                  if (self.contextMenuFeature) {
                    self.selectFeatureView(self.contextMenuFeature)
                  }
                },
              },
            ]
          : []
      },

      get menuOptions() {
        return [
          {
            label: 'Filter',
            onClick: self.openFilterConfig,
            icon: FilterListIcon,
          },
        ]
      },
    }))
    .volatile(() => ({
      ReactComponent: BlockBasedTrack,
    }))
}
