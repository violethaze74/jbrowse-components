import { ConfigurationSchema } from '@gmod/jbrowse-core/configuration'
import ConfigSchema from './configSchema'

export { WiggleRenderingReactComponent as ReactComponent } from '@gmod/jbrowse-plugin-wiggle'
export { default } from './SNPCoverageRenderer'

export const configSchema = ConfigurationSchema(
  'SNPCoverageRenderer',
  {},
  { baseConfiguration: ConfigSchema, explicitlyTyped: true },
)
