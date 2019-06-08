import SplitViewF from './SplitView'

export default class BreakpointPlugin {
  install(p) {
    const SplitView = p.jbrequire(SplitViewF)
    p.addViewType(() => SplitView)
  }

  configure() {}
}
