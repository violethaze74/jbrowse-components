import { Track, VcfTabixAdapter } from '../base'
import { getLocalOrRemoteStream } from '../util'
import { SingleBar, Presets } from 'cli-progress'
import { createGunzip } from 'zlib'
import readline from 'readline'

export async function* indexVcf(
  config: Track,
  attributesToIndex: string[],
  outLocation: string,
  typesToExclude: string[],
  quiet: boolean,
) {
  const { adapter, trackId } = config
  const {
    vcfGzLocation: { uri },
  } = adapter as VcfTabixAdapter

  // progress bar code was aided by blog post at
  // https://webomnizz.com/download-a-file-with-progressbar-using-node-js/
  const progressBar = new SingleBar(
    {
      format: '{bar} ' + trackId + ' {percentage}% | ETA: {eta}s',
      etaBuffer: 2000,
    },
    Presets.shades_classic,
  )

  let receivedBytes = 0
  const { totalBytes, stream } = await getLocalOrRemoteStream(uri, outLocation)

  if (!quiet) {
    progressBar.start(totalBytes, 0)
  }

  stream.on('data', chunk => {
    receivedBytes += chunk.length
    progressBar.update(receivedBytes)
  })

  const gzStream = uri.match(/.b?gz$/) ? stream.pipe(createGunzip()) : stream

  const rl = readline.createInterface({
    input: gzStream,
  })

  for await (const line of rl) {
    if (line.startsWith('#')) {
      continue
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [ref, pos, id, _ref, _alt, _qual, _filter, info] = line.split('\t')

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
          val ? decodeURIComponent(val).trim().split(',').join(' ') : undefined,
        ]),
    )

    const end = fields.END

    const locStr = `${ref}:${pos}..${end ? end : +pos + 1}`
    if (id === '.') {
      continue
    }

    const infoAttrs = attributesToIndex
      .map(attr => fields[attr])
      .filter((f): f is string => !!f)

    const ids = id.split(',')
    for (let i = 0; i < ids.length; i++) {
      const id = ids[i]
      const attrs = [id]
      const record = JSON.stringify([
        encodeURIComponent(locStr),
        encodeURIComponent(trackId),
        encodeURIComponent(id || ''),
        ...infoAttrs.map(a => encodeURIComponent(a || '')),
      ]).replace(/,/g, '|')
      yield `${record} ${[...new Set(attrs)].join(' ')}\n`
    }
  }

  progressBar.stop()
}
