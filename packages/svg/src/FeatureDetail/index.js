import { ConfigurationSchema } from '@gmod/jbrowse-core/configuration'
import { ElementId } from '@gmod/jbrowse-core/mst-types'
import { types } from 'mobx-state-tree'

const configSchema = ConfigurationSchema('FeatureDrawerWidget', {})

const stateModel = types
  .model('FeatureDrawerWidget', {
    id: ElementId,
    type: types.literal('FeatureDrawerWidget'),
    featureData: types.frozen({}),
  })
  .actions(self => ({
    setFeatureData(data) {
      self.featureData = data
    },
    clearFeatureData() {
      self.featureData = {}
    },
  }))

export { configSchema, stateModel }
export const ReactComponent = import('./FeatureDetail')
