export interface Mismatch {
  qual?: number
  start: number
  length: number
  type: string
  base: string
  altbase?: string
  seq?: string
  cliplen?: number
}
export function parseMD(md?: string) {
  return (md || '').split(/([ACGT\^])/)
}
export function parseCigar(cigar?: string) {
  return (cigar || '').split(/([MIDNSHPX=])/)
}
export function cigarToMismatches(
  ops: string[],
  seq: string,
  qual?: Buffer,
): Mismatch[] {
  let currOffset = 0
  let seqOffset = 0
  const mismatches: Mismatch[] = []
  for (let i = 0; i < ops.length - 1; i += 2) {
    const len = +ops[i]
    const op = ops[i + 1]
    if (op === 'M' || op === '=' || op === 'E') {
      seqOffset += len
    }
    if (op === 'I') {
      mismatches.push({
        start: currOffset,
        type: 'insertion',
        base: `${len}`,
        length: 0,
      })
      seqOffset += len
    } else if (op === 'D') {
      mismatches.push({
        start: currOffset,
        type: 'deletion',
        base: '*',
        length: len,
      })
    } else if (op === 'N') {
      mismatches.push({
        start: currOffset,
        type: 'skip',
        base: 'N',
        length: len,
      })
    } else if (op === 'X') {
      const r = seq.slice(seqOffset, seqOffset + len)
      const q = qual?.slice(seqOffset, seqOffset + len) || []

      for (let j = 0; j < len; j++) {
        mismatches.push({
          start: currOffset + j,
          type: 'mismatch',
          base: r[j],
          qual: q[j],
          length: 1,
        })
      }
      seqOffset += len
    } else if (op === 'H') {
      mismatches.push({
        start: currOffset,
        type: 'hardclip',
        base: `H${len}`,
        cliplen: len,
        length: 1,
      })
    } else if (op === 'S') {
      mismatches.push({
        start: currOffset,
        type: 'softclip',
        base: `S${len}`,
        cliplen: len,
        length: 1,
      })
      seqOffset += len
    }

    if (op !== 'I' && op !== 'S' && op !== 'H') {
      currOffset += len
    }
  }
  return mismatches
}

/**
 * parse a SAM MD tag to find mismatching bases of the template versus the reference
 * @returns array of mismatches and their positions
 */
export function mdToMismatches(
  mdstring: string,
  cigarOps: string[],
  seq: string,
  qual?: Buffer,
): Mismatch[] {
  const mdPositions = getMDPositions(mdstring)
  const refPositions = [
    ...getNextRefPos(
      cigarOps,
      mdPositions.map(m => m.position),
    ),
  ]
  const readPositions = [
    ...getNextReadPos(
      cigarOps,
      mdPositions.map(m => m.position),
    ),
  ]

  const ret = []
  for (let i = 0; i < refPositions.length; i++) {
    ret.push({
      start: refPositions[i],
      altbase: mdPositions[i].base,
      base: seq[readPositions[i]],
      length: 1,
      type: 'mismatch',
      ...(qual && { qual: qual[readPositions[i]] }),
    })
  }
  return ret
}

export function getMismatches(
  cigarString: string,
  mdString: string,
  seq: string,
  qual?: Buffer,
): Mismatch[] {
  let mismatches: Mismatch[] = []
  let cigarOps: string[] = []

  // parse the CIGAR tag if it has one
  if (cigarString) {
    cigarOps = parseCigar(cigarString)
    mismatches = mismatches.concat(cigarToMismatches(cigarOps, seq, qual))
  }

  // now let's look for CRAM or MD mismatches
  if (mdString) {
    mismatches = mismatches.concat(
      mdToMismatches(mdString, cigarOps, seq, qual),
    )
  }

  return mismatches
}

// adapted from minimap2 code static void write_MD_core function
export function generateMD(target: string, query: string, cigar: string) {
  let queryOffset = 0
  let targetOffset = 0
  let lengthMD = 0
  if (!target) {
    console.warn('no ref supplied to generateMD')
    return ''
  }
  const cigarOps = parseCigar(cigar)
  let str = ''
  for (let i = 0; i < cigarOps.length; i += 2) {
    const len = +cigarOps[i]
    const op = cigarOps[i + 1]
    if (op === 'M' || op === 'X' || op === '=') {
      for (let j = 0; j < len; j++) {
        if (
          query[queryOffset + j].toLowerCase() !==
          target[targetOffset + j].toLowerCase()
        ) {
          str += `${lengthMD}${target[targetOffset + j].toUpperCase()}`
          lengthMD = 0
        } else {
          lengthMD++
        }
      }
      queryOffset += len
      targetOffset += len
    } else if (op === 'I') {
      queryOffset += len
    } else if (op === 'D') {
      let tmp = ''
      for (let j = 0; j < len; j++) {
        tmp += target[targetOffset + j].toUpperCase()
      }
      str += `${lengthMD}^${tmp}`
      lengthMD = 0
      targetOffset += len
    } else if (op === 'N') {
      targetOffset += len
    } else if (op === 'S') {
      queryOffset += len
    }
  }
  if (lengthMD > 0) {
    str += lengthMD
  }
  return str
}

export function getMDPositions(md: string) {
  const ops = parseMD(md)
  const positions = []
  let refPos = 0

  let inDeletion = false

  for (let i = 0; i < ops.length; i += 2) {
    const d = +ops[i]
    const e = ops[i + 1]
    refPos += d

    if (inDeletion && d > 0) {
      inDeletion = false
    }
    if (e) {
      if (e === '^') {
        inDeletion = true
      } else if (!inDeletion) {
        positions.push({ base: e, position: refPos })
        refPos++
      }
    }
  }
  return positions
}

// get relative reference sequence positions for positions given relative to
// the read sequence
export function* getNextRefPos(cigarOps: string[], positions: number[]) {
  let cigarIdx = 0
  let readPos = 0
  let refPos = 0

  for (let i = 0; i < positions.length; i++) {
    const pos = positions[i]
    for (; cigarIdx < cigarOps.length && readPos < pos; cigarIdx += 2) {
      const len = +cigarOps[cigarIdx]
      const op = cigarOps[cigarIdx + 1]
      if (op === 'S' || op === 'I') {
        readPos += len
      } else if (op === 'D' || op === 'N') {
        refPos += len
      } else if (op === 'M' || op === 'X' || op === '=') {
        readPos += len
        refPos += len
      }
    }

    yield positions[i] - readPos + refPos
  }
}

// get relative reference sequence positions for positions given relative to
// the read sequence
export function* getNextReadPos(cigarOps: string[], positions: number[]) {
  let cigarIdx = 0
  let readPos = 0
  let refPos = 0

  for (let i = 0; i < positions.length; i++) {
    const pos = positions[i]
    for (; cigarIdx < cigarOps.length && readPos < pos; cigarIdx += 2) {
      const len = +cigarOps[cigarIdx]
      const op = cigarOps[cigarIdx + 1]
      if (op === 'S' || op === 'I') {
        readPos += len
      } else if (op === 'D' || op === 'N') {
      } else if (op === 'M' || op === 'X' || op === '=') {
        readPos += len
        refPos += len
      }
    }

    yield positions[i] - refPos + readPos
  }
}

export function getModificationPositions(mm: string, seq: string) {
  const mods = mm.split(';')
  return mods
    .filter(mod => !!mod)
    .map(mod => {
      const [basemod, ...rest] = mod.split(',')

      // regexes based on parse_mm.pl from hts-specs
      const matches = basemod.match(/([A-Z])([-+])([^,]+)/)
      if (!matches) {
        throw new Error('bad format for MM tag')
      }
      const [, base, strand, typestr] = matches

      // can be a multi e.g. C+mh for both meth (m) and hydroxymeth (h) so
      // split, and they can also be chemical codes (ChEBI) e.g. C+16061
      const types = typestr.split(/(\d+|.)/).filter(f => !!f)

      if (strand === '-') {
        console.warn('unsupported negative strand modifications')
        // make sure to return a somewhat matching type even in this case
        return { type: 'unsupported', positions: [] }
      }

      // this logic also based on parse_mm.pl from hts-specs is that in the
      // sequence of the read, if we have a modification type e.g. C+m;2 and a
      // sequence ACGTACGTAC we skip the two instances of C and go to the last
      // C
      return types.map(type => {
        let i = 0
        return {
          type,
          positions: rest
            .map(score => +score)
            .map(delta => {
              i++
              do {
                if (base === 'N' || base === seq[i]) {
                  delta--
                }
                i++
              } while (delta >= 0 && i < seq.length)
              i--
              return i
            }),
        }
      })
    })
    .flat()
}

export function getModificationTypes(mm: string) {
  const mods = mm.split(';')
  return mods
    .filter(mod => !!mod)
    .map(mod => {
      const [basemod] = mod.split(',')

      const matches = basemod.match(/([A-Z])([-+])([^,]+)/)
      if (!matches) {
        throw new Error('bad format for MM tag')
      }
      const [, , , type] = matches
      return type
    })
}
