import { types } from 'mobx-state-tree'
import { ElementId } from '@gmod/jbrowse-core/mst-types'

export default pluginManager =>
  types
    .model('HierarchicalTrackSelectorDrawerWidget', {
      id: ElementId,
      type: types.literal('HierarchicalTrackSelectorDrawerWidget'),
      collapsed: types.map(types.boolean), // map of category path -> boolean of whether it is collapsed
      filterText: '',
      view: types.safeReference(
        pluginManager.pluggableMstType('view', 'stateModel'),
      ),
    })
    .actions(self => ({
      setView(view) {
        self.view = view
      },
      toggleCategory(pathName) {
        self.collapsed.set(pathName, !self.collapsed.get(pathName))
      },
      clearFilterText() {
        self.filterText = ''
      },
      setFilterText(newText) {
        self.filterText = newText
      },
    }))
    .views(self => ({
      get assemblyNames() {
        const assemblyNames = []
        self.view.displayedRegions.forEach(displayedRegion => {
          if (!assemblyNames.includes(displayedRegion.assemblyName))
            assemblyNames.push(displayedRegion.assemblyName)
        })
        return assemblyNames
      },
    }))
