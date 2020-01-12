
/**
 * This is the common logic for both the Node.js and web browser
 * implementations of `debug()`.
 */

function setup(env) {
	createDebug.debug = createDebug;
	createDebug.default = createDebug;
	createDebug.coerce = coerce;
	createDebug.disable = disable;
	createDebug.enable = enable;
	createDebug.enabled = enabled;
	createDebug.humanize = require('ms');

	Object.keys(env).forEach(key => {
		createDebug[key] = env[key];
	});

	/**
	* Active `debug` instances.
	*/
	createDebug.instances = [];

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

	/**
	* Map of formatting handling functions, for output formatting.
	* m and _time are special hardcoded keys.
	*/
	createDebug.outputFormatters = {};

	/**
	 * Map %m to applying formatters to arguments
	 */

	createDebug.outputFormatters.m = function (_, args) {
		args[0] = createDebug.coerce(args[0]);

		if (typeof args[0] !== 'string') {
			// Anything else let's inspect with %O
			/**
			 * Note: This only inspects the first argument,
			 * so if debug({foo: "bar"}, {foo: "bar"}) is passed
			 * only the first object will be colored by node's formatters.O
			 */
			args.unshift('%O');
		}

		// Apply any `formatters` transformations
		let index = 0;
		args[0] = args[0].replace(/%([a-zA-Z%])/g, (match, format) => {
			// If we encounter an escaped % then don't increase the array index
			if (match === '%%') {
				return match;
			}
			index++;
			const formatter = createDebug.formatters[format];
			if (typeof formatter === 'function') {
				const val = args[index];
				match = formatter.call(this, val);

				// Now we need to remove `args[index]` since it's inlined in the `format`
				args.splice(index, 1);
				index--;
			}
			return match;
		});

		return args;
	};

	/**
	 * Map %+ to humanize()'s defaults (1000ms diff => "1s")
	 */

	createDebug.outputFormatters['+'] = function () {
		return '+' + createDebug.humanize(this.diff);
	};

	/**
	 * Map %d to returning milliseconds
	 */

	createDebug.outputFormatters.d = function () {
		return '+' + this.diff + 'ms';
	};

	/**
	 * Map %n to outputting namespace prefix
	 */

	createDebug.outputFormatters.n = function () {
		return this.namespace;
	};

	/**
	 * Map %_time to handling time...?
	 */

	createDebug.outputFormatters._time = function (format) {
		// Browser doesn't have date
		return new Date().toISOString();
	};

	/**
	* Map of meta-formatters which are applied to outputFormatters
	*/
	createDebug.metaFormatters = {};

	/**
	 * Map %J* to `JSON.stringify()`
	 */

	createDebug.outputFormatters.J = function (v) {
		return JSON.stringify(v);
	};

	/**
	 * Map %c* to to `applyColor()`
	 */

	createDebug.outputFormatters.c = function (v) {
		if (this.useColors) {
			return this.applyColor(v);
		} else {
			return v;
		}
	};

	/**
	 * Map %C* to to `applyColor(arg, bold = true)` (node)
	 */

	createDebug.outputFormatters.C = function (v) {
		if (this.useColors) {
			return this.applyColor(v, true);
		} else {
			return v;
		}
	};

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

		return createDebug.colors[Math.abs(hash) % createDebug.colors.length];
	}
	createDebug.selectColor = selectColor;

	/**
	* Create a debugger with the given `namespace`.
	*
	* @param {String} namespace
	* @return {Function}
	* @api public
	*/
	function createDebug(namespace) {
		let prevTime;

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

			// Apply relevant `outputFormatters` to `format`
			const reg = /%([a-zA-Z+]+|[a-zA-Z]*?\{.+\})/;
			let formattedArgs = [];
			let res;
			let outputFormat = self.format; // Make a copy of the format
			while (res = outputFormat.match(reg)) {
				let [matched, formatToken] = res;
				let formatter;
				let formatted;

				// Split out the part before the matched format token
				const split = outputFormat.slice(0, res.index);
				outputFormat = outputFormat.slice(res.index + matched.length);

				// And add it to the arguments
				if (split.length > 0) {
					formattedArgs.push(split);
				}

				const metaFormatters = [];
				// Extract metaformatters
				while (formatToken.length > 1 && !formatToken.startsWith('{')) {
					const metaFormatterToken = formatToken.slice(0, 1);
					formatToken = formatToken.slice(1);
					metaFormatters.push(createDebug.outputFormatters[metaFormatterToken]);
				}

				// Not really sure how to handle time at this point
				if (formatToken.startsWith('{')) {
					formatter = createDebug.outputFormatters._time;
				} else {
					formatter = createDebug.outputFormatters[formatToken];
				}
				if (typeof formatter === 'function') {
					formatted = formatter.call(self, formatToken, args);

					// Apply metaFormatters
					metaFormatters.forEach(metaFormatter => {
						if (typeof metaFormatter === 'function') {
							formatted = metaFormatter.call(self, formatted);
						}
					});

					if (Array.isArray(formatted)) { // Intended to concatenate %m's args in the middle of the format
						formattedArgs = formattedArgs.concat(formatted);
					} else {
						formattedArgs.push(formatted);
					}
				}
			}

			const logFn = self.log || createDebug.log;
			logFn.apply(self, formattedArgs);
		}

		debug.namespace = namespace;
		debug.enabled = createDebug.enabled(namespace);
		debug.useColors = createDebug.useColors();
		debug.format = createDebug.getFormat() || '%{H:M-Z}%n%m%+'; // '  %n%m%+'
		debug.color = selectColor(namespace);
		debug.applyColor = createDebug.applyColor.bind(debug);
		debug.destroy = destroy;
		debug.extend = extend;

		// Env-specific initialization logic for debug instances
		if (typeof createDebug.init === 'function') {
			createDebug.init(debug);
		}

		createDebug.instances.push(debug);

		return debug;
	}

	function destroy() {
		const index = createDebug.instances.indexOf(this);
		if (index !== -1) {
			createDebug.instances.splice(index, 1);
			return true;
		}
		return false;
	}

	function extend(namespace, delimiter) {
		const newDebug = createDebug(this.namespace + (typeof delimiter === 'undefined' ? ':' : delimiter) + namespace);
		newDebug.log = this.log;
		return newDebug;
	}

	/**
	* Enables a debug mode by namespaces. This can include modes
	* separated by a colon and wildcards.
	*
	* @param {String} namespaces
	* @api public
	*/
	function enable(namespaces) {
		createDebug.save(namespaces);

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

		for (i = 0; i < createDebug.instances.length; i++) {
			const instance = createDebug.instances[i];
			instance.enabled = createDebug.enabled(instance.namespace);
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
			...createDebug.skips.map(toNamespace).map(namespace => '-' + namespace)
		].join(',');
		createDebug.enable('');
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

	createDebug.enable(createDebug.load());

	return createDebug;
}

module.exports = setup;
