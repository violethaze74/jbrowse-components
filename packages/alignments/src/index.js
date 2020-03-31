import AdapterType from '@gmod/jbrowse-core/pluggableElementTypes/AdapterType'
import DrawerWidgetType from '@gmod/jbrowse-core/pluggableElementTypes/DrawerWidgetType'
import TrackType from '@gmod/jbrowse-core/pluggableElementTypes/TrackType'
import DisplayType from '@gmod/jbrowse-core/pluggableElementTypes/DisplayType'
import Plugin from '@gmod/jbrowse-core/Plugin'
import { lazy } from 'react'
import {
  configSchemaFactory as alignmentsTrackConfigSchemaFactory,
  modelFactory as alignmentsTrackModelFactory,
} from './AlignmentsTrack'
import {
  configSchemaFactory as alignmentsDisplayConfigSchemaFactory,
  modelFactory as alignmentsDisplayModelFactory,
} from './AlignmentsDisplay'
import {
  configSchema as alignmentsFeatureDetailConfigSchema,
  ReactComponent as AlignmentsFeatureDetailReactComponent,
  stateModel as alignmentsFeatureDetailStateModel,
} from './AlignmentsFeatureDetail'
import {
  configSchemaFactory as pileupDisplayConfigSchemaFactory,
  modelFactory as pileupDisplayModelFactory,
} from './PileupDisplay'
import {
  configSchemaFactory as snpCoverageDisplayConfigSchemaFactory,
  modelFactory as snpCoverageDisplayModelFactory,
} from './SNPCoverageDisplay'
import {
  AdapterClass as SNPCoverageAdapterClass,
  configSchema as snpCoverageAdapterConfigSchema,
} from './SNPCoverageAdapter'
import {
  AdapterClass as BamAdapterClass,
  configSchema as bamAdapterConfigSchema,
} from './BamAdapter'
import {
  AdapterClass as CramAdapterClass,
  configSchema as cramAdapterConfigSchema,
} from './CramAdapter'
import PileupRenderer, {
  configSchema as pileupRendererConfigSchema,
  ReactComponent as PileupRendererReactComponent,
} from './PileupRenderer'
import SNPCoverageRenderer, {
  configSchema as SNPCoverageRendererConfigSchema,
  ReactComponent as SNPCoverageRendererReactComponent,
} from './SNPCoverageRenderer'

export default class extends Plugin {
  install(pluginManager) {
    pluginManager.addTrackType(() => {
      const configSchema = alignmentsTrackConfigSchemaFactory(pluginManager)
      return new TrackType({
        name: 'AlignmentsTrack',
        configSchema,
        stateModel: alignmentsTrackModelFactory(pluginManager, configSchema),
      })
    })
    pluginManager.addDisplayType(() => {
      const configSchema = pileupDisplayConfigSchemaFactory(pluginManager)
      return new DisplayType({
        name: 'PileupDisplay',
        configSchema,
        stateModel: pileupDisplayModelFactory(pluginManager, configSchema),
      })
    })
    pluginManager.addDrawerWidgetType(
      () =>
        new DrawerWidgetType({
          name: 'AlignmentsFeatureDrawerWidget',
          heading: 'Feature Details',
          configSchema: alignmentsFeatureDetailConfigSchema,
          stateModel: alignmentsFeatureDetailStateModel,
          LazyReactComponent: lazy(() => AlignmentsFeatureDetailReactComponent),
        }),
    )
    pluginManager.addDisplayType(() => {
      const configSchema = snpCoverageDisplayConfigSchemaFactory(pluginManager)
      return new DisplayType({
        name: 'SNPCoverageDisplay',
        configSchema,
        stateModel: snpCoverageDisplayModelFactory(configSchema),
      })
    })
    pluginManager.addDisplayType(() => {
      const configSchema = alignmentsDisplayConfigSchemaFactory(pluginManager)
      return new DisplayType({
        name: 'AlignmentsComboDisplay',
        configSchema,
        stateModel: alignmentsDisplayModelFactory(pluginManager, configSchema),
      })
    })
    pluginManager.addAdapterType(
      () =>
        new AdapterType({
          name: 'BamAdapter',
          configSchema: bamAdapterConfigSchema,
          AdapterClass: BamAdapterClass,
        }),
    )
    pluginManager.addAdapterType(
      () =>
        new AdapterType({
          name: 'SNPCoverageAdapter',
          configSchema: snpCoverageAdapterConfigSchema,
          AdapterClass: SNPCoverageAdapterClass,
        }),
    )
    pluginManager.addAdapterType(
      () =>
        new AdapterType({
          name: 'CramAdapter',
          requiresSequenceAdapter: true,
          configSchema: cramAdapterConfigSchema,
          AdapterClass: CramAdapterClass,
        }),
    )
    pluginManager.addRendererType(
      () =>
        new PileupRenderer({
          name: 'PileupRenderer',
          ReactComponent: PileupRendererReactComponent,
          configSchema: pileupRendererConfigSchema,
        }),
    )
    pluginManager.addRendererType(
      () =>
        new SNPCoverageRenderer({
          name: 'SNPCoverageRenderer',
          ReactComponent: SNPCoverageRendererReactComponent,
          configSchema: SNPCoverageRendererConfigSchema,
        }),
    )
  }
}
