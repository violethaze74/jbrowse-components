import path from 'path'
import { Application } from 'spectron'

// normally you can say import electronPath from 'electron' but doesn't work
// here, possibly due to monorepo
const electronPath = path.resolve(
  __dirname,
  '../../../../node_modules/.bin/electron',
)

jest.setTimeout(10000) // increase to 50000 on low spec laptop
let app = null

beforeAll(() => {
  const dir = path.join(__dirname, '../../')
  app = new Application({
    path: electronPath,
    args: [dir],
  })

  return app.start()
})

afterAll(() => {
  if (app && app.isRunning()) {
    return app.stop()
  }
  return undefined
})

test('Click on LGV', async () => {
  const count = await app.client.getWindowCount()
  expect(count).toEqual(1)

  // on splash screen
  await app.client.$('//h5[text()="Start a new session"]')
  // click on lgv
  ;(await app.client.$('//h6[text()="Linear Genome View"]')).click()
  // at lgv import form
  await app.client.$('//span[text()="Show all regions in assembly"]')
})
