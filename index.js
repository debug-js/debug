var isRenderer = require('is-electron-renderer');
if (isRenderer) {
  module.exports = require('./browser.js');
} else {
  module.exports = require('./node.js');
}
