/**
 * Detect Electron renderer / nwjs process, which is node, but we should
 * treat as a browser.
 */


if (typeof process === 'undefined' || process.type === 'renderer' || process.browser === true || process.__nwjs) {
  module.exports = require('./browser.js');
} else {
  module.exports = require('./node.js');
  if (process.env.DEBUG_USE_MICROSECONDS) {
    var humanizeMs = module.exports.humanize
    module.exports.humanize = delta => {
      if (delta > 10000) {
        return humanizeMs((delta + 500) / 1000)
      }
      return `${delta}µs`
    }
  }
}
