import createDebugNode from './node.js';
import createDebugBrowser from './browser.js';

let isBrowser;
try {
	isBrowser = (typeof process === 'undefined' || process.type === 'renderer' || process.browser === true || process.__nwjs);
} catch (e) {
	// access to `process` fails when internalized for browser
	isBrowser = true;
}

const createDebug = isBrowser ? createDebugBrowser : createDebugNode;

export default createDebug;
