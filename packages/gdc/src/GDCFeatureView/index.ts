import { ElementId } from '@gmod/jbrowse-core/util/types/mst'
import { types } from 'mobx-state-tree'

export const stateModel = types
  .model('GDCFeatureView', {
    id: ElementId,
    type: types.literal('GDCFeatureView'),
    featureData: types.frozen({}),
  })
  .actions(self => ({
    setWidth(newWidth: number) {
      self.width = newWidth
    },
    setHeight(newHeight: number) {
      self.height = newHeight
    },
    setFeatureData(data: any) {
      self.featureData = data
    },
    clearFeatureData() {
      self.featureData = {}
    },
  }))
  .volatile(() => ({
    width: 800,
    height: 300,
  }))

export { default as ReactComponent } from '../GDCFeatureDrawerWidget/GDCFeatureDrawerWidget'
