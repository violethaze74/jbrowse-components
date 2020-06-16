import { ElementId } from '@gmod/jbrowse-core/util/types/mst'
import { types } from 'mobx-state-tree'

export const stateModel = types
  .model('GDCFeatureView', {
    id: ElementId,
    type: types.literal('GDCFeatureView'),
    featureData: types.frozen({}),
  })
  .volatile(() => ({
    width: 800,
  }))
  .actions(self => ({
    setWidth(newWidth: number) {
      self.width = newWidth
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    setFeatureData(data: any) {
      self.featureData = data
    },
    clearFeatureData() {
      self.featureData = {}
    },
  }))

export { default as ReactComponent } from '../GDCFeatureDrawerWidget/GDCFeatureDrawerWidget'
