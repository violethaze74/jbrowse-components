import {
  ConfigurationReference,
  ConfigurationSchema,
} from '@gmod/jbrowse-core/configuration'
import PluginManager from '@gmod/jbrowse-core/PluginManager'
import { types } from 'mobx-state-tree'
import {
  configSchemaFactory as basicTrackConfigSchemaFactory,
  stateModelFactory as basicTrackStateModelFactory,
} from '../BasicTrack'

export function configSchemaFactory(pluginManager: PluginManager) {
  const basicTrackConfigSchema = basicTrackConfigSchemaFactory(pluginManager)
  return ConfigurationSchema(
    'DynamicTrack',
    {},
    { baseConfiguration: basicTrackConfigSchema, explicitlyTyped: true },
  )
}

type ConfigSchemaType = ReturnType<typeof configSchemaFactory>

export const stateModelFactory = (configSchema: ConfigSchemaType) =>
  types.compose(
    'DynamicTrack',
    basicTrackStateModelFactory(configSchema),
    types
      .model({
        type: types.literal('DynamicTrack'),
        configuration: ConfigurationReference(configSchema),
      })
      .views((/* self */) => ({
        get blockType() {
          return 'dynamicBlocks'
        },
        get renderDelay() {
          return 500
        },
      })),
  )
