import { Gff3TabixAdapter, Track } from '../base'
import { Transform, TransformOptions } from 'stream'
import { isURL, createRemoteStream } from '../types/common'
import { MultiBar } from 'cli-progress'
import { createGunzip } from 'zlib'
import pump from 'pump'
import split2 from 'split2'
import path from 'path'
import fs from 'fs'

class Gff3Transform extends Transform {
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
    if (!chunk) {
      console.error('hererere', chunk)
    }
    const line = chunk.toString()
    if (!line.startsWith('#') && !line.startsWith('>')) {
      const [seq_id, , type, start, end, , , , col9] = line.split('\t')
      const locStr = `${seq_id}:${start}..${end}`

      if (!this.typesToExclude.includes(type)) {
        // turns gff3 attrs into a map, and converts the arrays into space
        // separated strings
        const col9attrs = Object.fromEntries(
          col9
            .split(';')
            .map(f => f.trim())
            .filter(f => !!f)
            .map(f => f.split('='))
            .map(([key, val]) => [
              key.trim(),
              decodeURIComponent(val).trim().split(',').join(' '),
            ]),
        )
        const attrs = this.attributes
          .map(attr => col9attrs[attr])
          .filter((f): f is string => !!f)

        if (attrs.length) {
          const record = JSON.stringify([
            encodeURIComponent(locStr),
            encodeURIComponent(this.trackId),
            ...attrs.map(a => encodeURIComponent(a)),
          ]).replace(/,/g, '|')

          this.push(`${record} ${[...new Set(attrs)].join(' ')}\n`)
        }
      }
    }
    done()
  }
}

export async function indexGff3(
  config: Track,
  attributes: string[],
  outLocation: string,
  typesToExclude: string[],
  quiet: boolean,
  multibar: MultiBar,
) {
  const { adapter, trackId } = config
  const {
    gffGzLocation: { uri },
  } = adapter as Gff3TabixAdapter

  // progress bar code was aided by blog post at
  // https://webomnizz.com/download-a-file-with-progressbar-using-node-js/
  // const progressBar = new SingleBar(
  //   {
  //     format: '{bar} ' + trackId + ' {percentage}% | ETA: {eta}s',
  //     etaBuffer: 2000,
  //   },
  //   Presets.shades_classic,
  // )
  let progressBar: any

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
    ...(uri.endsWith('.gz')
      ? [fileDataStream, createGunzip()]
      : [fileDataStream]),
    split2(),
    new Gff3Transform({ attributes, typesToExclude, trackId }),
    function (err) {
      if (err) {
        console.error('failed', err)
      }
      progressBar?.stop()
    },
  )
}
