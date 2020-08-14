/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  BaseFeatureDataAdapter,
  BaseOptions,
} from '@gmod/jbrowse-core/data_adapters/BaseAdapter'
import { Region } from '@gmod/jbrowse-core/util/types'
import { ObservableCreate } from '@gmod/jbrowse-core/util/rxjs'
import { Feature } from '@gmod/jbrowse-core/util/simpleFeature'
import { Instance } from 'mobx-state-tree'
import { readConfObject } from '@gmod/jbrowse-core/configuration'
import { getSubAdapterType } from '@gmod/jbrowse-core/data_adapters/dataAdapterCache'
import { toArray } from 'rxjs/operators'
import MyConfigSchema from './configSchema'

export default class PairwiseLookup extends BaseFeatureDataAdapter {
  private assemblyNames: string[]

  private subadapters: BaseFeatureDataAdapter[]

  public static capabilities = ['getFeatures', 'getRefNames']

  public constructor(
    config: Instance<typeof MyConfigSchema>,
    getSubAdapter: getSubAdapterType,
  ) {
    super(config)
    const assemblyNames = readConfObject(config, 'assemblyNames') as string[]
    const subadapters = readConfObject(config, 'subadapters')
    this.assemblyNames = assemblyNames
    this.subadapters = subadapters.map(
      (subadapter: any) => getSubAdapter(subadapter).dataAdapter,
    )
  }

  async hasDataForRefName() {
    // determining this properly is basically a call to getFeatures
    // so is not really that important, and has to be true or else
    // getFeatures is never called (BaseAdapter filters it out)
    return true
  }

  async getRefNames() {
    // we cannot determine this accurately
    return []
  }

  getFeatures(region: Region, opts: BaseOptions = {}) {
    return ObservableCreate<Feature>(async observer => {
      const index = this.assemblyNames.indexOf(region.assemblyName)
      console.log({ index, region })
      if (index !== -1) {
        const ob = this.subadapters[index].getFeatures(region, opts)
        const feats = await ob.pipe(toArray()).toPromise()
        feats.forEach(feat => observer.next(feat))
      }

      observer.complete()
    })
  }

  freeResources(/* { region } */): void {}
}
