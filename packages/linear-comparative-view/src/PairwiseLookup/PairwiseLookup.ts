/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  BaseFeatureDataAdapter,
  BaseOptions,
} from '@gmod/jbrowse-core/data_adapters/BaseAdapter'
import {
  FileLocation,
  NoAssemblyRegion,
  Region,
} from '@gmod/jbrowse-core/util/types'
import { doesIntersect2 } from '@gmod/jbrowse-core/util/range'
import { GenericFilehandle } from 'generic-filehandle'
import { openLocation } from '@gmod/jbrowse-core/util/io'
import { ObservableCreate } from '@gmod/jbrowse-core/util/rxjs'
import SimpleFeature, { Feature } from '@gmod/jbrowse-core/util/simpleFeature'
import AbortablePromiseCache from 'abortable-promise-cache'
import QuickLRU from '@gmod/jbrowse-core/util/QuickLRU'
import { Instance } from 'mobx-state-tree'
import { readConfObject } from '@gmod/jbrowse-core/configuration'
import { getSubAdapterType } from '@gmod/jbrowse-core/data_adapters/dataAdapterCache'
import MyConfigSchema from './configSchema'

interface PafRecord {
  records: NoAssemblyRegion[]
  extra: {
    blockLen: number
    mappingQual: number
    numMatches: number
    strand: string
  }
}

export default class PairwiseLiftover extends BaseFeatureDataAdapter {
  private cache = new AbortablePromiseCache({
    cache: new QuickLRU({ maxSize: 1 }),
    fill: (data: BaseOptions, signal?: AbortSignal) => {
      return this.setup({ ...data, signal })
    },
  })

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
      if (index !== -1) {
        const ob = this.subadapters[index].getFeatures(region, opts)
        ob.subscribe(observer)
        // for (let i = 0; i < pafRecords.length; i++) {
        //   const { extra, records } = pafRecords[i]
        //   const { start, end, refName } = records[index]
        //   if (records[index].refName === region.refName) {
        //     if (doesIntersect2(region.start, region.end, start, end)) {
        //       observer.next(
        //         new SimpleFeature({
        //           uniqueId: `row_${i}`,
        //           start,
        //           end,
        //           refName,
        //           syntenyId: i,
        //           mate: {
        //             start: records[+!index].start,
        //             end: records[+!index].end,
        //             refName: records[+!index].refName,
        //           },
        //           ...extra,
        //         }),
        //       )
        //     }
        //   }
        // }
      }

      observer.complete()
    })
  }

  freeResources(/* { region } */): void {}
}
