/* eslint-disable import/no-extraneous-dependencies */
const path = require('path')
const CopyPlugin = require('copy-webpack-plugin')

const buildDir = path.resolve('.')
const distDir = path.resolve(buildDir, 'dist')

module.exports = {
  mode: process.env.NODE_ENV || 'production',
  entry: path.join(buildDir, 'src', 'index.js'),
  devtool: process.env.NODE_ENV === 'development' ? 'source-map' : false,
  output: {
    path: distDir,
    filename: 'jbrowse-linear-genome-view.js',
    // publicPath:
    //   '//s3.amazonaws.com/jbrowse.org/jb2_releases/jbrowse-linear-genome-view/jbrowse-linear-genome-view%40v1.1.0/umd/',
    sourceMapFilename: '[id].jbrowse-linear-genome-view.js.map',
    library: 'JBrowseLinearGenomeView',
    libraryExport: 'default',
    libraryTarget: 'umd',
  },
  devServer: {
    contentBase: path.join(distDir, 'assets'),
    port: 9000,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': '*',
    },
  },
  plugins: [
    new CopyPlugin({
      patterns: [{ from: path.resolve(buildDir, 'assets'), to: distDir }],
      options: { concurrency: 100 },
    }),
  ],
  resolve: {
    extensions: [
      '.mjs',
      '.web.js',
      '.js',
      '.ts',
      '.tsx',
      '.json',
      '.web.jsx',
      '.jsx',
    ],
  },
  node: {
    fs: 'empty',
  },
  module: {
    rules: [
      {
        oneOf: [
          {
            test: /\.m?[tj]sx?$/,
            exclude: /(node_modules|bower_components)/,
            use: {
              loader: 'babel-loader',
              options: {
                rootMode: 'upward',
                presets: ['@babel/preset-react'],
              },
            },
          },
          {
            loader: require.resolve('file-loader'),
            exclude: [/\.(js|mjs|jsx|ts|tsx)$/, /\.html$/, /\.json$/],
          },
          // ** STOP ** Are you adding a new loader?
          // Make sure to add the new loader(s) before the "file" loader.
        ],
      },
    ],
  },
}