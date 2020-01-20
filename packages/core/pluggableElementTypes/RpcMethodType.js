// this is an RPC method that can be registered by a plugin
import PluggableElementType from './PluggableElementBase'

export default class RpcMethodType extends PluggableElementType {
  constructor(stuff, subClassDefaults = {}) {
    super(stuff, {}, subClassDefaults)
    if (!this.call) {
      throw new Error(`no call() code defined for ${this.name}`)
    }
  }
}
