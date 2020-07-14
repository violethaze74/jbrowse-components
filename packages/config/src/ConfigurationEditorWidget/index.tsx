import { observer } from 'mobx-react'
import { isStateTreeNode, getType } from 'mobx-state-tree'
import React from 'react'
import { ConfigurationSchema } from '@gmod/jbrowse-core/configuration'

export { default as ReactComponent } from './components/ConfigurationEditor'
export { default as stateModelFactory } from './model'
export const configSchema = ConfigurationSchema('ConfigurationEditorWidget', {})
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const HeadingComponent = observer(({ model }: { model: any }) => {
  if (model && model.target) {
    if (model.target.type) {
      return <>`${model.target.type} Settings`</>
    }
    if (isStateTreeNode(model.target)) {
      const type = getType(model.target)
      if (type && type.name) {
        return <>`${type.name.replace('ConfigurationSchema', '')} Settings`</>
      }
    }
  }
  return <>Settings</>
})
