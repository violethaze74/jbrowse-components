import { lazy } from 'react'
import { types, IAnyStateTreeNode } from 'mobx-state-tree'
import { getSession } from '@jbrowse/core/util'
import { getRpcSessionId } from '@jbrowse/core/util/tracks'
import PaletteIcon from '@material-ui/icons/Palette'
import FilterListIcon from '@material-ui/icons/FilterList'
import { AnyConfigurationModel } from '@jbrowse/core/configuration/configurationSchema'
import { BlockSet } from '@jbrowse/core/util/blockTypes'

const ColorByTagDlg = lazy(() => import('./components/ColorByTag'))
const FilterByTagDlg = lazy(() => import('./components/FilterByTag'))
const ModificationsDlg = lazy(() => import('./components/ColorByModifications'))

export const colorByModel = types.maybe(
  types.model({
    type: types.string,
    tag: types.maybe(types.string),
  }),
)

export const filterByModel = types.optional(
  types.model({
    flagInclude: types.optional(types.number, 0),
    flagExclude: types.optional(types.number, 1536),
    readName: types.maybe(types.string),
    tagFilter: types.maybe(
      types.model({ tag: types.string, value: types.maybe(types.string) }),
    ),
  }),
  {},
)

export const colorSchemeMenu = (
  self: IAnyStateTreeNode & { setColorScheme: Function },
) => ({
  label: 'Color scheme',
  icon: PaletteIcon,
  subMenu: [
    {
      label: 'Normal',
      onClick: () => {
        self.setColorScheme({ type: 'normal' })
      },
    },
    {
      label: 'Mapping quality',
      onClick: () => {
        self.setColorScheme({ type: 'mappingQuality' })
      },
    },
    {
      label: 'Strand',
      onClick: () => {
        self.setColorScheme({ type: 'strand' })
      },
    },
    {
      label: 'Pair orientation',
      onClick: () => {
        self.setColorScheme({ type: 'pairOrientation' })
      },
    },
    {
      label: 'Per-base quality',
      onClick: () => {
        self.setColorScheme({ type: 'perBaseQuality' })
      },
    },
    {
      label: 'Base modifications (MM+MP/ML)',
      onClick: () => {
        getSession(self).setDialogComponent(ModificationsDlg, {
          model: self,
        })
      },
    },
    {
      label: 'Methylation (specialized MM+MP/ML)',
      onClick: () => {
        self.setColorScheme({ type: 'methylation' })
      },
    },
    {
      label: 'Insert size',
      onClick: () => {
        self.setColorScheme({ type: 'insertSize' })
      },
    },
    {
      label: 'Stranded paired-end',
      onClick: () => {
        self.setColorScheme({ type: 'reverseTemplate' })
      },
    },
    {
      label: 'Color by tag...',
      onClick: () => {
        getSession(self).setDialogComponent(ColorByTagDlg, {
          model: self,
        })
      },
    },
  ],
})

export const setDisplayModeMenu = (
  self: IAnyStateTreeNode & { setDisplayMode: Function },
) => ({
  label: 'Set display mode',
  subMenu: [
    {
      label: 'Normal',
      onClick: () => {
        self.setDisplayMode('normal')
      },
    },
    {
      label: 'Compact',
      onClick: () => {
        self.setDisplayMode('compact')
      },
    },
    {
      label: 'Squish',
      onClick: () => {
        self.setDisplayMode('squish')
      },
    },
  ],
})

export const filterByMenu = (self: IAnyStateTreeNode) => ({
  label: 'Filter by',
  icon: FilterListIcon,
  onClick: () => {
    getSession(self).setDialogComponent(FilterByTagDlg, {
      model: self,
    })
  },
})

export async function getUniqueTagValues(
  self: IAnyStateTreeNode & { adapterConfig: AnyConfigurationModel },
  colorScheme: { type: string; tag?: string },
  blocks: BlockSet,
  opts?: {
    headers?: Record<string, string>
    signal?: AbortSignal
    filters?: string[]
  },
) {
  const { rpcManager } = getSession(self)
  const { adapterConfig } = self
  const sessionId = getRpcSessionId(self)
  const values = await rpcManager.call(
    getRpcSessionId(self),
    'PileupGetGlobalValueForTag',
    {
      adapterConfig,
      tag: colorScheme.tag,
      sessionId,
      regions: blocks.contentBlocks,
      ...opts,
    },
  )
  return values as string[]
}

export async function getUniqueModificationValues(
  self: IAnyStateTreeNode,
  adapterConfig: AnyConfigurationModel,
  colorScheme: { type: string; tag?: string },
  blocks: BlockSet,
  opts?: {
    headers?: Record<string, string>
    signal?: AbortSignal
    filters?: string[]
  },
) {
  const { rpcManager } = getSession(self)
  const sessionId = getRpcSessionId(self)
  const values = await rpcManager.call(
    sessionId,
    'PileupGetVisibleModifications',
    {
      adapterConfig,
      tag: colorScheme.tag,
      sessionId,
      regions: blocks.contentBlocks,
      ...opts,
    },
  )
  return values as string[]
}
