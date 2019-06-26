import { ConfigurationSchema } from '@gmod/jbrowse-core/configuration'
import { ObservableCreate } from '@gmod/jbrowse-core/util/rxjs'
import SimpleFeature from '@gmod/jbrowse-core/util/simpleFeature'
import {
  AdapterClass as BamAdapter,
  configSchema as bamAdapterConfigSchema,
} from '../BamAdapter'

export const configSchema = ConfigurationSchema(
  'BamIndexCovAdapter',
  {
    averageFeatureLength: {
      type: 'number',
      defaultValue: 150,
      description:
        'Index coverage produces number of features overlapping a region. If you want per-base feature depth, this can correspond to #features * #avg_len / 16kb',
    },
  },
  { baseConfiguration: bamAdapterConfigSchema, explicitlyTyped: true },
)

export class AdapterClass extends BamAdapter {
  static capabilities = ['getFeatures', 'getRefNames', 'getGlobalStats']

  private averageFeatureLength = 150

  constructor(opts) {
    super(opts)
    this.averageFeatureLength = opts.averageFeatureLength
  }

  async getGlobalStats() {
    return { scoreMax: 5000, scoreMin: 0 }
  }

  /**
   * Fetch features for a certain region. Use getFeaturesInRegion() if you also
   * want to verify that the store has features for the given reference sequence
   * before fetching.
   * @param {Region} param
   * @param {AbortSignal} [signal] optional signalling object for aborting the fetch
   * @returns {Observable[Feature]} Observable of Feature objects in the region
   */
  getFeatures({ refName, start, end }, { signal }) {
    return ObservableCreate(async observer => {
      await this.setup()
      const records = await this.bam.indexCov(refName, start, end, {
        signal,
      })
      console.log(this.averageFeatureLength)
      records.forEach(record => {
        record.score = record.score * this.averageFeatureLength / 16384
        observer.next(new SimpleFeature({ id: record.start + 1, data: record }))
      })
      observer.complete()
    })
  }
}
