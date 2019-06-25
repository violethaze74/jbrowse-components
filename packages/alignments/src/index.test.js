import { createTestSession } from '@gmod/jbrowse-web/src/jbrowseModel'
import { getSnapshot, types } from 'mobx-state-tree'

const createMockTrackStateModel = track =>
  types
    .model({
      selectedFeature: types.frozen(),
      bpPerPx: 0.05,
      staticBlocks: types.frozen(),
      track: track.stateModel,
    })
    .actions(self => ({
      setSelection(thing) {
        self.selection = thing
      },
      clearSelection() {
        self.selection = undefined
      },
      event(event, target, targetType) {
        if (event.type === 'click' && targetType === 'alignmentsFeature')
          self.setSelection(target)
      },
    }))

const createMockTrack = track =>
  createMockTrackStateModel(track).create({
    staticBlocks: [],
    track: {
      configuration: track.configSchema.create({
        type: 'AlignmentsTrack',
      }),
      type: 'AlignmentsTrack',
    },
  })

test('create bam adapter config', async () => {
  const { pluginManager } = await createTestSession()

  const BamAdapter = pluginManager.getAdapterType('BamAdapter')
  const config = BamAdapter.configSchema.create({ type: 'BamAdapter' })
  expect(getSnapshot(config)).toMatchSnapshot({
    configId: expect.any(String),
    index: { configId: expect.any(String) },
  })
})
test('create track config', async () => {
  const { pluginManager } = await createTestSession()

  const AlignmentsTrack = pluginManager.getTrackType('AlignmentsTrack')
  const config2 = AlignmentsTrack.configSchema.create({
    type: 'AlignmentsTrack',
  })
  expect(getSnapshot(config2)).toMatchSnapshot({
    adapter: {
      configId: expect.any(String),
      index: {
        configId: expect.any(String),
      },
    },
    configId: expect.any(String),
    renderers: {
      PileupRenderer: {
        configId: expect.any(String),
      },
      SvgFeatureRenderer: {
        configId: expect.any(String),
        labels: {
          configId: expect.any(String),
        },
      },
      configId: expect.any(String),
    },
  })
})

test('test selection in alignments track model with mock root', async () => {
  const { pluginManager } = await createTestSession()

  const rootModel = createMockTrack(
    pluginManager.getTrackType('AlignmentsTrack'),
  )

  rootModel.event(
    { type: 'click' },
    {
      id() {
        return 1234
      },
    },
    'alignmentsFeature',
  )
  expect(rootModel.selection.id()).toBe(1234)

  rootModel.event({ type: 'click' }, undefined, 'alignmentsFeature')
  expect(rootModel.selection).not.toBeTruthy()
})
