import { ConfigurationSchema } from '@gmod/jbrowse-core/configuration'
import PluginManager from '@gmod/jbrowse-core/PluginManager'
import RpcManager from '@gmod/jbrowse-core/rpc/RpcManager'
import { openLocation } from '@gmod/jbrowse-core/util/io'
import { flow, getSnapshot, resolveIdentifier, types } from 'mobx-state-tree'
import shortid from 'shortid'
import corePlugins from './corePlugins'
import sessionModelFactory from './sessions/sessionModelFactory'
import RenderWorker from './workers/rpc.worker'
import * as rpcFuncs from './workers/rpcMethods'

const configuration = ConfigurationSchema('JBrowseWeb', {
  rpc: RpcManager.configSchema,
}).create()

const pluginManager = new PluginManager(corePlugins.map(P => new P()))
pluginManager.configure()
const rpcManager = new RpcManager(pluginManager, configuration.rpc, {
  WebWorkerRpcDriver: { WorkerClass: RenderWorker },
  MainThreadRpcDriver: { rpcFuncs },
})

const Session = sessionModelFactory(pluginManager, rpcManager)

// poke some things for testing (this stuff will eventually be removed)
window.getSnapshot = getSnapshot
window.resolveIdentifier = resolveIdentifier

const JBrowseWeb = types
  .model('JBrowseWeb', {
    sessions: types.map(Session),
    activeSession: types.safeReference(Session),
    errorMessage: '',
  })
  .actions(self => ({
    addSession(sessionConfig) {
      if (sessionConfig.uri || sessionConfig.localPath)
        self.addSessionFromLocation(sessionConfig)
      else
        try {
          let { defaultSession } = sessionConfig
          if (!defaultSession) defaultSession = {}
          if (!defaultSession.menuBars)
            defaultSession.menuBars = [{ type: 'MainMenuBar' }]
          const {
            name = `Unnamed Session ${shortid.generate()}`,
          } = defaultSession

          const data = {
            name,
            ...defaultSession,
            configuration: sessionConfig,
          }
          self.sessions.set(name, data)
          if (!self.activeSession) {
            self.activateSession(name)
          }
        } catch (error) {
          console.error('Failed to add session', error)
          self.errorMessage = String(error)
        }
    },
    addSessionFromLocation: flow(function* addSessionFromLocation(
      sessionConfigLocation,
    ) {
      try {
        const configSnapshot = JSON.parse(
          yield openLocation(sessionConfigLocation).readFile('utf8'),
        )
        self.addSession(configSnapshot)
      } catch (error) {
        console.error('Failed to fetch config', error)
        self.errorMessage = String(error)
      }
    }),
    activateSession(name) {
      self.activeSession = name
      // poke some things for testing (this stuff will eventually be removed)
      window.MODEL = self.sessions.get(name)
    },
  }))
  .views(self => ({
    get sessionNames() {
      return Array.from(self.sessions.keys())
    },
  }))
  .volatile(self => ({
    configuration,
    // pluginManager,
    // rpcManager,
  }))

export function createTestSession(snapshot = {}, root = false) {
  const jbrowseState = JBrowseWeb.create()
  jbrowseState.configuration.rpc.defaultDriver.set('MainThreadRpcDriver')
  jbrowseState.addSession(snapshot)
  if (root) return jbrowseState
  return jbrowseState.activeSession
}

export default JBrowseWeb
