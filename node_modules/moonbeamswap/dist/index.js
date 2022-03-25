
'use strict'

if (process.env.NODE_ENV === 'production') {
  module.exports = require('./moonbeamswap.cjs.production.min.js')
} else {
  module.exports = require('./moonbeamswap.cjs.development.js')
}
