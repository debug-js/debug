/**
 * Detect Electron renderer / nwjs process, which is node, but we should
 * treat as a browser.
 */

if (typeof process === 'undefined' || process.type === 'renderer' || process.browser === true || process.__nwjs) {
  module.exports = require('./browser.js');
  module.exports = require('./electron.js');
} else {
	module.exports = require('./node.js');
}
