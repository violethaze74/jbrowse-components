import { types, getSnapshot } from 'mobx-state-tree'
import PluginManager from './PluginManager'

describe('base data adapter', () => {
  it('properly propagates errors in feature fetching', async () => {
    const P = new PluginManager()
    P.addDisplayType(() => {
      return {
        name: 'KittyDisplay',
        configSchema: types.model({ hello: 'world' }),
      }
    })

    P.registerDisplayTypeForTrack({
      track: 'KittyTrack',
      display: 'KittyDisplay',
    })
    P.configure()

    expect(P.getElementType('display', 'KittyDisplay')).toMatchSnapshot()
    const res = P.pluggableDisplayTypesForTrack('KittyTrack')

    expect(getSnapshot(res.create({})).hello).toEqual('world')
  })
})
