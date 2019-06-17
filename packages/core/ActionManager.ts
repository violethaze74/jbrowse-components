export default class {
  private actionRegistry: Map<string, Map<string, Function>>

  public constructor() {
    this.actionRegistry = new Map()
  }

  public registerAction(
    actionTargetType: string,
    eventType: string,
    action: Function,
  ): void {
    const registeredEventTypes = this.actionRegistry.get(actionTargetType)
    if (registeredEventTypes) registeredEventTypes.set(eventType, action)
    else
      this.actionRegistry.set(actionTargetType, new Map([[eventType, action]]))
  }

  public performAction(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    session: any,
    actionTargetType: string,
    eventType: string,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    target: any,
  ): // eslint-disable-next-line @typescript-eslint/no-explicit-any
  any {
    const registeredEventTypes = this.actionRegistry.get(actionTargetType)
    if (!registeredEventTypes) return undefined
    const registeredAction = registeredEventTypes.get(eventType)
    if (!registeredAction) return undefined
    return registeredAction(session, target)
  }
}
