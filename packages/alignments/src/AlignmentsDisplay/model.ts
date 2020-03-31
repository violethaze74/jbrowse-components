import {
  getConf,
  ConfigurationReference,
} from '@gmod/jbrowse-core/configuration'
import { BaseTrack } from '@gmod/jbrowse-plugin-linear-genome-view'
import { types, addDisposer } from 'mobx-state-tree'
import { autorun } from 'mobx'
import AlignmentsDisplayComponent from './components/AlignmentsDisplay'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default (pluginManager: any, configSchema: any) => {
  return types
    .compose(
      'AlignmentsDisplay',
      BaseTrack,
      types
        .model({
          PileupDisplay: types.maybe(
            pluginManager.getDisplayType('PileupDisplay').stateModel,
          ),
          SNPCoverageDisplay: types.maybe(
            pluginManager.getDisplayType('SNPCoverageDisplay').stateModel,
          ),
          type: types.literal('AlignmentsDisplay'),
          configuration: ConfigurationReference(configSchema),
          height: 250,
        })
        .volatile(() => ({
          ReactComponent: AlignmentsDisplayComponent,
        })),
    )
    .views(self => ({
      get pileupDisplayConfig() {
        return {
          ...getConf(self),
          type: 'PileupDisplay',
          name: `${getConf(self, 'name')} pileup`,
          trackId: `${self.configuration.trackId}_pileup`,
        }
      },

      get layoutFeatures() {
        return self.PileupDisplay.layoutFeatures
      },

      get snpCoverageDisplayConfig() {
        return {
          ...getConf(self),
          type: 'SNPCoverageDisplay',
          name: `${getConf(self, 'name')} snpcoverage`,
          trackId: `${self.configuration.trackId}_snpcoverage`,
          adapter: {
            type: 'SNPCoverageAdapter',
            subadapter: getConf(self, 'adapter'),
          },
        }
      },
    }))
    .actions(self => ({
      afterAttach() {
        addDisposer(
          self,
          autorun(() => {
            this.setSNPCoverageDisplay(self.snpCoverageDisplayConfig)
            this.setPileupDisplay(self.pileupDisplayConfig)
          }),
        )
      },
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      setSNPCoverageDisplay(displayConfig: any) {
        self.SNPCoverageDisplay = {
          type: 'SNPCoverageDisplay',
          configuration: displayConfig,
        }
        self.SNPCoverageDisplay.height = 40
      },
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      setPileupDisplay(displayConfig: any) {
        self.PileupDisplay = {
          type: 'PileupDisplay',
          configuration: displayConfig,
        }
      },
    }))
}
