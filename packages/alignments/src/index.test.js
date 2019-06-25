import { createTestSession } from '@gmod/jbrowse-web/src/jbrowseModel'
import { getSnapshot } from 'mobx-state-tree'
import MyPlugin from './index'

test('plugin in a stock JBrowse', () => {
  const { pluginManager } = createTestSession()
  expect(() => pluginManager.addPlugin(new MyPlugin())).toThrow(
    /JBrowse already configured, cannot add plugins/,
  )

  const BamAdapter = pluginManager.getAdapterType('BamAdapter')
  const config = BamAdapter.configSchema.create({ type: 'BamAdapter' })
  expect(getSnapshot(config)).toMatchSnapshot({
    configId: expect.any(String),
    index: { configId: expect.any(String) },
  })
})
