import { Track, VcfTabixAdapter } from '../base'
import { isURL, createRemoteStream } from '../types/common'
import { Transform, TransformOptions } from 'stream'
import { SingleBar, MultiBar } from 'cli-progress'
import { createGunzip } from 'zlib'
import pump from 'pump'
import split2 from 'split2'
import path from 'path'
import fs from 'fs'

class VcfTransform extends Transform {
  typesToExclude: string[]
  attributes: string[]
  trackId: string

  constructor(
    args: TransformOptions & {
      typesToExclude: string[]
      attributes: string[]
      trackId: string
    },
  ) {
    super(args)
    this.typesToExclude = args.typesToExclude
    this.attributes = args.attributes
    this.trackId = args.trackId
  }

  _transform(chunk: Buffer, encoding: unknown, done: () => void) {
    const line = chunk.toString()
    if (!line.startsWith('#')) {
      const [ref, pos, id, , , , , info] = line.split('\t')

      // turns gff3 attrs into a map, and converts the arrays into space
      // separated strings
      const fields = Object.fromEntries(
        info
          .split(';')
          .map(f => f.trim())
          .filter(f => !!f)
          .map(f => f.split('='))
          .map(([key, val]) => [
            key.trim(),
            val
              ? decodeURIComponent(val).trim().split(',').join(' ')
              : undefined,
          ]),
      )

      const end = fields.END

      const locStr = `${ref}:${pos}..${end ? end : +pos + 1}`
      if (id === '.') {
        done()
        return
      }

      const infoAttrs = this.attributes
        .map(attr => fields[attr])
        .filter((f): f is string => !!f)

      const ids = id.split(',')
      const lines = []
      for (let i = 0; i < ids.length; i++) {
        const id = ids[i]
        const attrs = [id]
        const record = JSON.stringify([
          encodeURIComponent(locStr),
          encodeURIComponent(this.trackId),
          encodeURIComponent(id || ''),
          ...infoAttrs.map(a => encodeURIComponent(a || '')),
        ]).replace(/,/g, '|')
        lines.push(`${record} ${[...new Set(attrs)].join(' ')}\n`)
      }
      this.push(lines.join(''))
    }
    done()
  }
}

export async function indexVcf(
  config: Track,
  attributes: string[],
  outLocation: string,
  typesToExclude: string[],
  quiet: boolean,
  multibar: MultiBar,
) {
  const { adapter, trackId } = config
  const {
    vcfGzLocation: { uri },
  } = adapter as VcfTabixAdapter

  let progressBar: SingleBar
  let fileDataStream
  let totalBytes = 0
  let receivedBytes = 0
  if (isURL(uri)) {
    fileDataStream = await createRemoteStream(uri)
    totalBytes = +(fileDataStream.headers['content-length'] || 0)
  } else {
    const filename = path.isAbsolute(uri) ? uri : path.join(outLocation, uri)
    totalBytes = fs.statSync(filename).size
    fileDataStream = fs.createReadStream(filename)
  }

  if (!quiet) {
    progressBar = multibar.create(totalBytes, 0, { file: trackId })
  }

  fileDataStream.on('data', chunk => {
    receivedBytes += chunk.length
    progressBar?.update(receivedBytes, { file: trackId })
  })

  return pump(
    uri.endsWith('.gz') ? fileDataStream.pipe(createGunzip()) : fileDataStream,
    split2(),
    new VcfTransform({ attributes, typesToExclude, trackId }),
    function (err) {
      if (err) {
        console.error('failed', err)
      }
      progressBar?.stop()
    },
  )
}
