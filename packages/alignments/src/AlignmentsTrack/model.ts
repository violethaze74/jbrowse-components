import { ConfigurationReference } from '@gmod/jbrowse-core/configuration'
import { BaseTrack } from '@gmod/jbrowse-plugin-linear-genome-view'
import { types } from 'mobx-state-tree'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default (pluginManager: any, configSchema: any) => {
  return types.compose(
    'AlignmentsTrack',
    BaseTrack,
    types.model({
      type: types.literal('AlignmentsTrack'),
      configuration: ConfigurationReference(configSchema),
    }),
  )
}
