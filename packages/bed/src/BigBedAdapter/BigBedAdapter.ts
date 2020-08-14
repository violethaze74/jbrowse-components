/* eslint-disable @typescript-eslint/no-explicit-any */
import { BigBed } from '@gmod/bbi'
import BED from '@gmod/bed'
import {
  BaseFeatureDataAdapter,
  BaseOptions,
} from '@gmod/jbrowse-core/data_adapters/BaseAdapter'
import { Region, FileLocation } from '@gmod/jbrowse-core/util/types'
import { openLocation } from '@gmod/jbrowse-core/util/io'
import { ObservableCreate } from '@gmod/jbrowse-core/util/rxjs'
import SimpleFeature, { Feature } from '@gmod/jbrowse-core/util/simpleFeature'
import { map, toArray, mergeAll } from 'rxjs/operators'
import { readConfObject } from '@gmod/jbrowse-core/configuration'
import { Instance } from 'mobx-state-tree'
import configSchema from './configSchema'
import { ucscProcessedTranscript } from '../util'

interface BEDFeature {
  chrom: string
  chromStart: number
  chromEnd: number
  [key: string]: any
}

interface Parser {
  parseLine: (line: string, opts: { uniqueId: string | number }) => BEDFeature
}

interface RawFeature {
  start: number
  end: number
  rest?: string
  uniqueId?: string
}

export default class BigBedAdapter extends BaseFeatureDataAdapter {
  private bigbed: BigBed

  private parser: Promise<Parser>

  public constructor(config: Instance<typeof configSchema>) {
    super(config)
    const bigBedLocation = readConfObject(
      config,
      'bigBedLocation',
    ) as FileLocation
    this.bigbed = new BigBed({
      filehandle: openLocation(bigBedLocation),
    })

    this.parser = this.bigbed
      .getHeader()
      .then(({ autoSql }: { autoSql: string }) => new BED({ autoSql }))
  }

  public async getRefNames() {
    const { refsByName } = await this.bigbed.getHeader()
    return Object.keys(refsByName)
  }

  public async refIdToName(refId: number) {
    const { refsByNumber } = this.bigbed.getHeader()
    return (refsByNumber[refId] || {}).name
  }

  public getFeatures(region: Region, opts: BaseOptions = {}) {
    const { refName, start, end } = region
    const { signal } = opts
    return ObservableCreate<Feature>(async observer => {
      try {
        const parser = await this.parser

        const ob = await this.bigbed.getFeatureStream(refName, start, end, {
          signal,
          basesPerSpan: end - start,
        })

        const feats = await ob.pipe(toArray()).toPromise()
        const features = feats.flat()

        features.map((r: RawFeature) => {
          const data = parser.parseLine(
            `${refName}\t${r.start}\t${r.end}\t${r.rest}`,
            {
              uniqueId: r.uniqueId as string,
            },
          )

          const { blockCount, blockSizes, blockStarts, chromStarts } = data

          if (blockCount) {
            const starts = chromStarts || blockStarts || []
            const sizes = blockSizes
            const blocksOffset = r.start
            data.subfeatures = []

            for (let b = 0; b < blockCount; b += 1) {
              const bmin = (starts[b] || 0) + blocksOffset
              const bmax = bmin + (sizes[b] || 0)
              data.subfeatures.push({
                uniqueId: `${r.uniqueId}-${b}`,
                start: bmin,
                end: bmax,
                type: 'block',
              })
            }
          }

          if (r.uniqueId === undefined) {
            throw new Error('invalid bbi feature')
          }

          const f = new SimpleFeature({
            id: `${this.id}-${r.uniqueId}`,
            data: {
              ...data,
              start: r.start,
              end: r.end,
              syntenyId: +data.name,
              refName,
            },
          })

          observer.next(f.get('thickStart') ? ucscProcessedTranscript(f) : f)
        })
      } catch (e) {
        observer.error(e)
      }
      observer.complete()
    }, opts.signal)
  }

  public freeResources(): void {}
}
