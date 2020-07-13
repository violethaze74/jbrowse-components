
'use strict'

if (process.env.NODE_ENV === 'production') {
  module.exports = require('./jbrowse-plugin-sequence.cjs.production.min.js')
} else {
  module.exports = require('./jbrowse-plugin-sequence.cjs.development.js')
}
