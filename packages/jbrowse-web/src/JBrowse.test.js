import {
  cleanup,
  fireEvent,
  render,
  waitForElement,
} from 'react-testing-library'
import React from 'react'

import fetchMock from 'fetch-mock'
import { LocalFile } from 'generic-filehandle'
import rangeParser from 'range-parser'
import { renderRegion, freeResources } from './workers/rpcMethods'

import model, { createTestSession } from './jbrowseModel'
import JBrowse from './JBrowse'
import config from '../test_data/config_integration_test.json'

fetchMock.config.sendAsJson = false

window.requestIdleCallback = cb => cb()
window.cancelIdleCallback = () => {}

const getFile = url => new LocalFile(require.resolve(`../${url}`))
// fakes server responses from local file object with fetchMock
const readBuffer = async (url, args) => {
  let file
  try {
    file = getFile(url)
  } catch (e) {
    return { status: 404 }
  }
  const maxRangeRequest = 1000000 // kind of arbitrary, part of the rangeParser
  if (args.headers.range) {
    const range = rangeParser(maxRangeRequest, args.headers.range)
    const { start, end } = range[0]
    const len = end - start
    const buf = Buffer.alloc(len)
    const { bytesRead } = await file.read(buf, 0, len, start)
    const stat = await file.stat()
    return {
      status: 206,
      body: buf.slice(0, bytesRead),
      headers: { 'Content-Range': `${start}-${end}/${stat.size}` },
    }
  }
  const body = await file.readFile()
  return { status: 200, body }
}

afterEach(cleanup)

fetchMock.mock('*', readBuffer)

// this is just a little hack to silence a warning that we'll get until react
// fixes this: https://github.com/facebook/react/pull/14853
const originalError = console.error
beforeAll(() => {
  console.error = (...args) => {
    if (/Warning.*not wrapped in act/.test(args[0])) {
      return
    }
    originalError.call(console, ...args)
  }
})

afterAll(() => {
  console.error = originalError
})

describe('valid file tests', () => {
  let jbrowseState
  beforeEach(() => {
    jbrowseState = model.create()
    jbrowseState.configuration.rpc.defaultDriver.set('MainThreadRpcDriver')
    jbrowseState.addSession(config)
  })

  it('access about menu', async () => {
    const { getByText } = render(<JBrowse state={jbrowseState} />)
    await waitForElement(() => getByText('JBrowse'))
    fireEvent.click(getByText('Help'))
    fireEvent.click(getByText('About'))

    const dlg = await waitForElement(() => getByText(/About JBrowse/))
    expect(dlg).toBeTruthy()
  })

  it('click and drag to move sideways', async () => {
    const { getByTestId, getByText } = render(<JBrowse state={jbrowseState} />)
    await waitForElement(() => getByText('ctgA'))
    fireEvent.click(
      await waitForElement(() => getByTestId('volvox_alignments')),
    )
    const start = window.MODEL.views[0].offsetPx
    const track = await waitForElement(() =>
      getByTestId('track-volvox_alignments'),
    )
    fireEvent.mouseDown(track, { clientX: 250, clientY: 20 })
    fireEvent.mouseMove(track, { clientX: 100, clientY: 20 })
    fireEvent.mouseUp(track, { clientX: 100, clientY: 20 })
    const end = window.MODEL.views[0].offsetPx
    expect(end - start).toEqual(150)
  })

  it('opens track selector', async () => {
    const { getByTestId } = render(<JBrowse state={jbrowseState} />)

    await waitForElement(() => getByTestId('volvox_alignments'))
    expect(window.MODEL.views[0].tracks.length).toBe(0)
    fireEvent.click(
      await waitForElement(() => getByTestId('volvox_alignments')),
    )
    expect(window.MODEL.views[0].tracks.length).toBe(1)
  })

  it('opens reference sequence track and expects zoom in message', async () => {
    const { getByTestId, getByText } = render(<JBrowse state={jbrowseState} />)
    fireEvent.click(await waitForElement(() => getByTestId('volvox_refseq')))
    window.MODEL.views[0].setNewView(20, 0)
    await waitForElement(() => getByTestId('track-volvox_refseq'))
    expect(getByText('Zoom in to see sequence')).toBeTruthy()
  })
})

describe('some error state', () => {
  let jbrowseState
  beforeEach(() => {
    jbrowseState = model.create()
    jbrowseState.configuration.rpc.defaultDriver.set('MainThreadRpcDriver')
    jbrowseState.addSession(config)
  })

  it('test that track with 404 file displays error', async () => {
    const { getByTestId, getByText } = render(<JBrowse state={jbrowseState} />)
    fireEvent.click(
      await waitForElement(() => getByTestId('volvox_alignments_nonexist')),
    )
    expect(
      await waitForElement(() =>
        getByText(
          'HTTP 404 fetching /test_data/volvox-sorted.bam.bai.nonexist',
        ),
      ),
    ).toBeTruthy()
  })
  it('test that bam with contigA instead of ctgA displays', async () => {
    const { getByTestId, getByText } = render(<JBrowse configs={[config]} />)
    fireEvent.click(
      await waitForElement(() => getByTestId('volvox_bam_altname')),
    )
    expect(
      await waitForElement(() => getByText('ctgA_110_638_0:0:0_3:0:0_15b')),
    ).toBeTruthy()
  })
})

describe.only('variant', () => {
  it('click on a vcf feature', async () => {
    const { getByTestId: byId, getByText } = render(
      <JBrowse configs={[config]} />,
    )
    await waitForElement(() => getByText('JBrowse'))
    window.MODEL.views[0].setNewView(0.05, 5000)
    fireEvent.click(await waitForElement(() => byId('volvox_filtered_vcf')))
    fireEvent.click(await waitForElement(() => byId('vcf-2560')))
    expect(await waitForElement(() => getByText('ctgA:277..277'))).toBeTruthy()
  })
})

describe('bigwig', () => {
  it('open a bigwig track', async () => {
    const { getByTestId: byId, getByText } = render(
      <JBrowse configs={[config]} />,
    )
    await waitForElement(() => getByText('JBrowse'))
    window.MODEL.views[0].setNewView(0.05, 5000)
    fireEvent.click(await waitForElement(() => byId('volvox_microarray')))
    await waitForElement(() => byId('prerendered_canvas'))
  })
  it('open a bigwig line track', async () => {
    const { getByTestId: byId, getByText } = render(
      <JBrowse configs={[config]} />,
    )
    await waitForElement(() => getByText('JBrowse'))
    window.MODEL.views[0].setNewView(0.05, 5000)
    fireEvent.click(await waitForElement(() => byId('volvox_microarray_line')))
    await waitForElement(() => byId('prerendered_canvas'))
  })
  it('open a bigwig density track', async () => {
    const { getByTestId: byId, getByText } = render(
      <JBrowse configs={[config]} />,
    )
    await waitForElement(() => getByText('JBrowse'))
    window.MODEL.views[0].setNewView(0.05, 5000)
    fireEvent.click(
      await waitForElement(() => byId('volvox_microarray_density')),
    )
    await waitForElement(() => byId('prerendered_canvas'))
  })
})

const baseprops = {
  region: { refName: 'ctgA', start: 0, end: 800 },
  sessionId: 'knickers the cow',
  adapterType: 'BamAdapter',
  adapterConfig: {
    configId: '7Hc9NkuD4x',
    type: 'BamAdapter',
    bamLocation: {
      localPath: require.resolve('../public/test_data/volvox-sorted.bam'),
    },
    index: {
      configId: 'sGW8va26pr',
      location: {
        localPath: require.resolve('../public/test_data/volvox-sorted.bam.bai'),
      },
    },
  },
  rootConfig: {},
  renderProps: { bpPerPx: 1 },
}

describe('render tests', () => {
  let pluginManager
  beforeEach(() => {
    ;({ pluginManager } = createTestSession())
  })

  it('can render a single region with Pileup + BamAdapter', async () => {
    const testprops = { ...baseprops, rendererType: 'PileupRenderer' }

    const result = await renderRegion(pluginManager, testprops)
    expect(new Set(Object.keys(result))).toEqual(
      new Set(['features', 'html', 'layout', 'height', 'width', 'imageData']),
    )
    expect(result.features.length).toBe(93)
    expect(result.html).toMatchSnapshot()
    expect(result.layout).toMatchSnapshot()
    expect(result.imageData.width).toBe(800)
    expect(result.imageData.height).toBe(result.layout.totalHeight)
    expect(result.width).toBe(800)
    expect(result.height).toBe(result.layout.totalHeight)

    expect(
      freeResources(pluginManager, {
        sessionId: 'knickers the cow',
      }),
    ).toBe(2)

    expect(
      freeResources(pluginManager, {
        sessionId: 'fozzy bear',
      }),
    ).toBe(0)
  })

  it('can render a single region with SvgFeatures + BamAdapter', async () => {
    const testprops = {
      ...baseprops,
      rendererType: 'SvgFeatureRenderer',
      region: { refName: 'ctgA', start: 0, end: 300 },
    }

    const result = await renderRegion(pluginManager, testprops)
    expect(new Set(Object.keys(result))).toEqual(
      new Set(['html', 'features', 'layout']),
    )
    expect(result.features.length).toBe(25)
    expect(result.html).toMatchSnapshot()
    expect(result.layout).toMatchSnapshot()

    expect(
      freeResources(pluginManager, {
        sessionId: 'knickers the cow',
      }),
    ).toBe(2)

    expect(
      freeResources(pluginManager, {
        sessionId: 'fozzy bear',
      }),
    ).toBe(0)
  })

  it('throws if no session ID', async () => {
    const testprops = {
      ...baseprops,
      rendererType: 'PileupRenderer',
      sessionId: undefined,
    }

    await expect(renderRegion(pluginManager, testprops)).rejects.toThrow(
      /must pass a unique session id/,
    )
  })

  it('throws on unrecoginze worker', async () => {
    const testprops = {
      ...baseprops,
      rendererType: 'NonexistentRenderer',
    }

    await expect(renderRegion(pluginManager, testprops)).rejects.toThrow(
      /renderer "NonexistentRenderer" not found/,
    )
  })
})
