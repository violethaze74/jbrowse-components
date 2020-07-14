import { IAnyStateTreeNode } from 'mobx-state-tree'
import { ComponentType } from 'react'

declare const AddConnectionWidget: ComponentType<{
  model: IAnyStateTreeNode
  session: IAnyStateTreeNode
}>
export default AddConnectionWidget
