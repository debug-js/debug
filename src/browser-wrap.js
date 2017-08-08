if (process.env.NODE_ENV !== 'production') {
  module.exports = require('./browser')
} else {
  function noop () {}
  module.exports = noop
  module.exports.log = noop
  module.exports.formatArgs = noop
  module.exports.save = noop
  module.exports.useColors = noop
}
