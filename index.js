/**
 * Detect Electron renderer process, which is node, but we should
 * treat as a browser.
 */

if ((process || {}).type === 'renderer') {
  module.exports = require('./browser');
} else {
  module.exports = require('./node');
}
