import { ConfigurationSchema } from '@gmod/jbrowse-core/configuration'

export default ConfigurationSchema(
  'PairwiseLookup',
  {
    assemblyNames: {
      type: 'stringArray',
      defaultValue: [],
    },
    subadapters: {
      type: 'frozen',
      defaultValue: [],
    },
  },
  { explicitlyTyped: true },
)
