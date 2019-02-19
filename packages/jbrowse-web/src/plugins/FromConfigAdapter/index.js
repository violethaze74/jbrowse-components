import { ConfigurationSchema } from '../../configuration'

import AdapterClass from './FromConfigAdapter'

const configSchema = ConfigurationSchema(
  'FromConfigAdapter',
  {
    assemblyName: {
      type: 'string',
      defaultValue: '',
    },
    features: {
      type: 'frozen',
      defaultValue: {},
    },
  },
  { explicitlyTyped: true },
)

// TODO: this could be OK
export default pluginManager => [
  {
    type: 'adapter',
    name: 'FromConfigAdapter',
    configSchema,
    AdapterClass,
  },
]
