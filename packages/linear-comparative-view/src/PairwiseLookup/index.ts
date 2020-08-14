import AdapterClass from './PairwiseLookup'
import configSchema from './configSchema'

export default ({ jbrequire }: { jbrequire: Function }) => {
  const AdapterType = jbrequire(
    '@gmod/jbrowse-core/pluggableElementTypes/AdapterType',
  )
  return new AdapterType({
    name: 'PairwiseLookup',
    AdapterClass,
    configSchema,
  })
}
