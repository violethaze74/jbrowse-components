import { ConfigurationSchema } from '../../configuration'
import Plugin, { WidgetType, MenuBarType } from '../../Plugin'
import {
  HelloWorldWidgetModelFactory,
  HelloWorldMenuBarModelFactory,
} from './model'
import HelloWorldMenuBar from './components/HelloWorldMenuBa'
import HelloWorldWidget from './components/HelloWorldWidget'

export default class extends Plugin {
  install(pluginManager) {
    pluginManager.addMenuBarType(() => {
      const stateModel = HelloWorldMenuBarModelFactory(pluginManager)

      const configSchema = ConfigurationSchema('HelloWorldMenuBar', {})

      return new MenuBarType({
        name: 'HelloWorldMenuBar',
        configSchema,
        stateModel,
        ReactComponent: HelloWorldMenuBar,
      })
    })

    pluginManager.addWidgetType(() => {
      const stateModel = HelloWorldWidgetModelFactory(pluginManager)

      const configSchema = ConfigurationSchema('HelloWorldWidget', {})

      return new WidgetType({
        name: 'HelloWorldWidget',
        configSchema,
        stateModel,
        ReactComponent: HelloWorldWidget,
      })
    })
  }
}
