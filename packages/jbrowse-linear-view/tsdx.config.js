module.exports = {
  rollup(config) {
    const originalExternal = config.external
    config.external = (id, ...args) => {
      return id.startsWith('@gmod/') && !id.startsWith('@gmod/jbrowse-core')
        ? false
        : originalExternal(id, ...args)
    }
    return config
  },
}
