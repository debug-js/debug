/**
 * Detect Electron renderer / nwjs process, which is node, but we should
 * treat as a browser.
 */

const isBrowserNode = process.type === 'renderer' || process.browser === true || process.__nwjs;
const isBrowser = typeof process === 'undefined';

if (isBrowser || (isBrowserNode && !process.env.DEBUG_COLORS_NODE)) {
	module.exports = require('./browser.js');
} else {
	module.exports = require('./node.js');
}
