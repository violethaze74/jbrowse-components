// const typescript = require('rollup-plugin-typescript2')

// function monorepo() {
//   return {
//     name: 'monorepo',
//     resolveId(source) {
//       console.log('source', source)
//       return null
//     },
//     load(id) {
//       console.log('id', id)
//       return null
//     },
//   }
// }

module.exports = {
  rollup(config, opts) {
    // config.plugins.unshift(monorepo())
    const originalExternal = config.external
    config.external = (id, ...args) => {
      // console.log(id, ...args)
      // const c = originalExternal(id, ...args)
      // console.log(c)
      // return c
      return id.startsWith('@gmod/') ? false : originalExternal(id, ...args)
    }
    // const typescriptPluginIdx = config.plugins.findIndex(
    //   plugin => plugin.name === 'rpt2',
    // )
    // config.plugins.splice(
    //   typescriptPluginIdx,
    //   0,
    //   typescript({
    //     tsconfig: opts.tsconfig,
    //     tsconfigDefaults: {
    //       compilerOptions: {
    //         sourceMap: true,
    //         declaration: true,
    //         jsx: 'react',
    //       },
    //     },
    //     tsconfigOverride: {
    //       include: ['..'],
    //       exclude: ['.'],
    //       compilerOptions: {
    //         rootDir: '..',
    //         // TS -> esnext, then leave the rest to babel-preset-env
    //         target: 'esnext',
    //         // don't output declarations more than once
    //         // ...(outputNum > 0
    //         //   ? { declaration: false, declarationMap: false }
    //         //   : {}),
    //       },
    //     },
    //     check: !opts.transpileOnly,
    //     // useTsconfigDeclarationDir: Boolean(tsCompilerOptions?.declarationDir),
    //   }),
    // )
    // console.log(config)
    // const babelPlugin = config.plugins.find(plugin => plugin.name === 'babel')
    // if (babelPlugin) {
    //   const originalLoad = babelPlugin.load
    //   babelPlugin.load = (...args) => {
    //     console.log('load', ...args)
    //     const a = originalLoad(...args)
    //     console.log(a)
    //     return a
    //   }
    //   const originalTransform = babelPlugin.transform
    //   babelPlugin.transform = (...args) => {
    //     console.log('transform', ...args)
    //     const b = originalTransform(...args)
    //     console.log(b)
    //     return b
    //   }
    // }
    return config
  },
}
