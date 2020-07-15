import { ConfigurationSchema } from '@gmod/jbrowse-core/configuration'
import { ElementId } from '@gmod/jbrowse-core/util/types/mst'
import { types } from 'mobx-state-tree'

const configSchema = ConfigurationSchema('AlignmentsFeatureWidget', {})

const stateModel = types
  .model('AlignmentsFeatureWidget', {
    id: ElementId,
    type: types.literal('AlignmentsFeatureWidget'),
    featureData: types.frozen({}),
  })
  .actions(self => ({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    setFeatureData(data: Record<string, any>) {
      self.featureData = data
    },
    clearFeatureData() {
      self.featureData = {}
    },
  }))

export { configSchema, stateModel }
export { default as ReactComponent } from './AlignmentsFeatureDetail'
