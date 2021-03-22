import path from 'path'
import { Application } from 'spectron'

jest.setTimeout(10000) // increase to 50000 on low spec laptop
let app = null

beforeAll(() => {
  const dir = path.join(__dirname, '..', '..', 'public', 'electron.js')
  app = new Application({
    args: [dir],
  })

  console.log({ app })
  return app.start()
})

afterAll(() => {
  if (app && app.isRunning()) {
    return app.stop()
  }
  return undefined
})

test('App Init', async () => {
  const isVisible = await app.browserWindow.isVisible()
  expect(isVisible).toBe(true)
  const count = await app.client.getWindowCount()
  expect(count).toEqual(1)
})
