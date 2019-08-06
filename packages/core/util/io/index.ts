import { LocalFile, BlobFile, GenericFilehandle } from 'generic-filehandle'
import { openUrl as rangeFetcherOpenUrl } from './rangeFetcher'

export const openUrl = rangeFetcherOpenUrl

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function openLocation(location: any): GenericFilehandle {
  if (!location) throw new Error('must provide a location to openLocation')
  if (location.uri) {
    const { base, uri } = location
    if (!base) throw new TypeError('base URL required')
    return openUrl(new URL(uri, base).href)
  }
  if (location.localPath) {
    return new LocalFile(location.localPath)
  }
  if (location.blob) return new BlobFile(location.blob)
  throw new Error('invalid fileLocation')
}
