import BamAdapter from './BamAdapter'
import { ObservableCreate } from '@gmod/jbrowse-core/util/rxjs'
import SimpleFeature from '@gmod/jbrowse-core/util/simpleFeature'

export default class BamIndexCovAdapter extends BamAdapter {
  static capabilities = ['getFeatures', 'getRefNames', 'getGlobalStats']
  async getGlobalStats() {
    return {scoreMax: 5000,scoreMin:0}
  }

  /**
   * Fetch features for a certain region. Use getFeaturesInRegion() if you also
   * want to verify that the store has features for the given reference sequence
   * before fetching.
   * @param {Region} param
   * @param {AbortSignal} [signal] optional signalling object for aborting the fetch
   * @returns {Observable[Feature]} Observable of Feature objects in the region
   */
  getFeatures({ refName, start, end }, signal) {
    return ObservableCreate(async observer => {
      await this.setup()
      const records = await this.bam.indexCov(refName, start, end, {
        signal,
      })
      records.forEach(record => {
        observer.next(new SimpleFeature({ id: record.start + 1, data: record }))
      })
      observer.complete()
    })
  }
}
