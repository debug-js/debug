// var isRenderer = require('is-electron-renderer');
// if (isRenderer) {
module.exports = require('./browser.js');
module.exports.isRenderer = require('is-electron-renderer');
// } else {
//   module.exports = require('./node.js');
// }
