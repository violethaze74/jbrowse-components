import PluginManager from '@gmod/jbrowse-core/PluginManager'
import configSchemaF from './configSchema'
import AdapterClass from './BamAdapter'

export default (pluginManager: PluginManager) => {
  return {
    configSchema: pluginManager.load(configSchemaF),
    AdapterClass,
  }
}
