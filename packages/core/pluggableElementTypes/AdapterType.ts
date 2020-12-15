import PluggableElementBase from './PluggableElementBase'
import { AnyConfigurationSchemaType } from '../configuration/configurationSchema'
import type { BaseDataAdapter } from '../data_adapters/BaseAdapter'

export default class AdapterType<
  T extends typeof BaseDataAdapter
> extends PluggableElementBase {
  AdapterClass: T

  configSchema: AnyConfigurationSchemaType

  constructor(stuff: {
    name: string
    AdapterClass: T
    configSchema: AnyConfigurationSchemaType
  }) {
    super(stuff)
    this.AdapterClass = stuff.AdapterClass
    this.configSchema = stuff.configSchema
    if (!this.AdapterClass) {
      throw new Error(`no AdapterClass defined for adapter type ${this.name}`)
    }
  }
}
