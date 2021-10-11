import humanize from 'ms';

import * as nodeDebug from './node.js';
import * as browserDebug from './browser.js';


const backend = (typeof process === 'undefined' || process.type === 'renderer' || process.browser === true || process.__nwjs) ? browserDebug : nodeDebug;

const {
	init, log, formatArgs, save, load, useColors, setupFormatters, colors,
} = backend;

export default createDebug;

/**
 * The currently active debug mode names, and names to skip.
 */

createDebug.names = [];
createDebug.skips = [];

/**
* Map of special "%n" handling functions, for the debug "format" argument.
*
* Valid key names are a single, lower or upper-case letter, i.e. "n" and "N".
*/
createDebug.formatters = {};

createDebug.debug = createDebug;
createDebug.default = createDebug;
createDebug.coerce = coerce;
createDebug.disable = disable;
createDebug.enable = enable;
createDebug.enabled = enabled;
createDebug.humanize = humanize;

/**
* Selects a color for a debug namespace
* @param {String} namespace The namespace string for the for the debug instance to be colored
* @return {Number|String} An ANSI color code for the given namespace
* @api private
*/
function selectColor(namespace) {
	let hash = 0;

	for (let i = 0; i < namespace.length; i++) {
		hash = ((hash << 5) - hash) + namespace.charCodeAt(i);
		hash |= 0; // Convert to 32bit integer
	}

	return colors[Math.abs(hash) % colors.length];
}

/**
* Create a debugger with the given `namespace`.
*
* @param {String} namespace
* @return {Function}
* @api public
*/
function createDebug(namespace) {
	let prevTime;
	let enableOverride = null;
	let namespacesCache;
	let enabledCache;

	function debug(...args) {
		// Disabled?
		if (!debug.enabled) {
			return;
		}

		const self = debug;

		// Set `diff` timestamp
		const curr = Number(new Date());
		const ms = curr - (prevTime || curr);
		self.diff = ms;
		self.prev = prevTime;
		self.curr = curr;
		prevTime = curr;

		args[0] = coerce(args[0]);

		if (typeof args[0] !== 'string') {
			// Anything else let's inspect with %O
			args.unshift('%O');
		}

		// Apply any `formatters` transformations
		let index = 0;
		args[0] = args[0].replace(/%([a-zA-Z%])/g, (match, format) => {
			// If we encounter an escaped % then don't increase the array index
			if (match === '%%') {
				return '%';
			}
			index++;
			const formatter = createDebug.formatters[format];

			if (typeof formatter === 'function') {
				const val = args[index];
				match = formatter.call(self, val);

				// Now we need to remove `args[index]` since it's inlined in the `format`
				args.splice(index, 1);
				index--;
			}
			return match;
		});

		// Apply env-specific formatting (colors, etc.)
		formatArgs.call(self, args);

		const logFn = self.log || log;
		logFn.apply(self, args);
	}

	debug.namespace = namespace;
	debug.useColors = useColors();
	debug.color = selectColor(namespace);
	debug.extend = extend;

	Object.defineProperty(debug, 'enabled', {
		enumerable: true,
		configurable: false,
		get: () => {
			if (enableOverride !== null) {
				return enableOverride;
			}
			if (namespacesCache !== namespaces) {
				namespacesCache = namespaces;
				enabledCache = enabled(namespace);
			}

			return enabledCache;
		},
		set: v => {
			enableOverride = v;
		},
	});

	// Env-specific initialization logic for debug instances
	if (typeof init === 'function') {
		init(debug);
	}

	return debug;
}

function extend(namespace, delimiter) {
	const newDebug = createDebug(this.namespace + (typeof delimiter === 'undefined' ? ':' : delimiter) + namespace);
	newDebug.log = this.log;
	return newDebug;
}

let namespaces;

/**
* Enables a debug mode by namespaces. This can include modes
* separated by a colon and wildcards.
*
* @param {String} namespaces
* @api public
*/
function enable(namespaces_) {
	save(namespaces_);
	namespaces = namespaces_;

	createDebug.names = [];
	createDebug.skips = [];

	let i;
	const split = (typeof namespaces === 'string' ? namespaces : '').split(/[\s,]+/);
	const len = split.length;

	for (i = 0; i < len; i++) {
		if (!split[i]) {
			// ignore empty strings
			continue;
		}

		namespaces = split[i].replace(/\*/g, '.*?');

		if (namespaces[0] === '-') {
			createDebug.skips.push(new RegExp('^' + namespaces.substr(1) + '$'));
		} else {
			createDebug.names.push(new RegExp('^' + namespaces + '$'));
		}
	}
}

/**
* Disable debug output.
*
* @return {String} namespaces
* @api public
*/
function disable() {
	const namespaces = [
		...createDebug.names.map(toNamespace),
		...createDebug.skips.map(toNamespace).map(namespace => '-' + namespace),
	].join(',');
	enable('');
	return namespaces;
}

/**
* Returns true if the given mode name is enabled, false otherwise.
*
* @param {String} name
* @return {Boolean}
* @api public
*/
function enabled(name) {
	if (name[name.length - 1] === '*') {
		return true;
	}

	let i;
	let len;

	for (i = 0, len = createDebug.skips.length; i < len; i++) {
		if (createDebug.skips[i].test(name)) {
			return false;
		}
	}

	for (i = 0, len = createDebug.names.length; i < len; i++) {
		if (createDebug.names[i].test(name)) {
			return true;
		}
	}

	return false;
}

/**
* Convert regexp to namespace
*
* @param {RegExp} regxep
* @return {String} namespace
* @api private
*/
function toNamespace(regexp) {
	return regexp.toString()
		.substring(2, regexp.toString().length - 2)
		.replace(/\.\*\?$/, '*');
}

/**
* Coerce `val`.
*
* @param {Mixed} val
* @return {Mixed}
* @api private
*/
function coerce(val) {
	if (val instanceof Error) {
		return val.stack || val.message;
	}

	return val;
}

setupFormatters(createDebug.formatters);

enable(load());
