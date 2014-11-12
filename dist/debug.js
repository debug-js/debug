!function(e){if("object"==typeof exports&&"undefined"!=typeof module)module.exports=e();else if("function"==typeof define&&define.amd)define([],e);else{var f;"undefined"!=typeof window?f=window:"undefined"!=typeof global?f=global:"undefined"!=typeof self&&(f=self),f.debug=e()}}(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
/**
 * in-memory cache
 */

var enabled = [];
var disabled = [];

/**
 * Checks if the specified `ns` is enabled.
 *
 * @param {String} ns  Wildcards are not supported here
 * @returns {Boolean}
 */

exports.enabled = function (ns) {
  if (find(disabled, ns, true) > -1) return false;
  if (find(enabled, ns, true) > -1) return true;
  return false;
};

/**
 * Destroys the lists of enabled/disabled. (primarilly for testing purposes)
 */

exports.clear = function () {
  disabled.length = enabled.length = 0; // truncates w/o destroying
};

/**
 * Outputs the list of enable/disabled in a single string.
 *
 * @returns {String}
 */

exports.stringify = function () {
  var e = enabled.map(function (item) {
    return item.string;
  });

  var d = disabled.map(function (item) {
    return '-' + item.string;
  });

  return e.concat(d).join(',');
};

/**
 * Parses a list and enables/disables accordingly.
 *
 * This list can either be passed from the user directly, or from .stringify()
 *
 * @param {String} str
 */

exports.parse = function (str) {
  if (!str) return;
  str.split(/[\s,]+/).forEach(function (ns) {
    if (!ns) return;
    else if ('-' == ns[0]) exports.disable(ns.slice(1));
    else                   exports.enable(ns);
  });
};

/**
 * Enables the specified `ns`.
 *
 * @param {String} ns
 */

exports.enable = function (ns) {
  prune(disabled, ns);
  if (find(enabled, ns) > -1) return;

  enabled.push({
    string: ns,
    regex: regex(ns)
  });
};

/**
 * Disables the specified `ns`.
 *
 * @param {String} ns
 */

exports.disable = function (ns) {
  prune(enabled, ns);
  if (find(disabled, ns) > -1) return;

  disabled.push({
    string: ns,
    regex: regex(ns)
  });
};

/**
 * Searches for the given `ns` in the `arr`.
 *
 * By default, it only matches on the raw string, but if `regex` is set, it will
 * match via the `RegExp` instead.
 *
 * Returns the index of the match, or -1 if not found.
 *
 * @param {Array} arr
 * @param {String} ns
 * @param {Boolean} [regex]
 * @returns {Number}
 */

function find(arr, ns, regex) {
  var ret = -1;
  arr.some(function (item, x) {
    if (regex ? item.regex.test(ns) : ns === item.string) {
      ret = x;
      return true;
    }
  });
  return ret;
}

/**
 * Wraps around `find(...)`, but also removes the found item.
 *
 * @param {Array} arr
 * @param {String} ns
 * @param {Boolean} [regex]
 */

function prune(arr, ns, regex) {
  var x = find(arr, ns, regex);
  if (x > -1) arr.splice(x, 1);
}

/**
 * Converts a raw `ns` into a `RegExp`.
 *
 * @param {String} ns
 * @returns {RegExp}
 */

function regex(ns) {
  var pattern = ns.replace(/\*/g, '.*?');
  return new RegExp('^' + pattern + '$');
}

},{}],2:[function(require,module,exports){

/**
 * This is the common logic for both the Node.js and web browser
 * implementations of `debug()`.
 *
 * Expose `debug()` as the module.
 */

exports = module.exports = debug;
exports.coerce = coerce;
exports.humanize = require('ms');
exports.dynamic = dynamic;

var able = require('./able');
exports.enabled = able.enabled;
exports.enable = able.enable;
exports.disable = able.disable;

/**
 * Map of special "%n" handling functions, for the debug "format" argument.
 *
 * Valid key names are a single, lowercased letter, i.e. "n".
 */

exports.formatters = {};

/**
 * Flag for dynamic status.
 */

var isDynamic = false;

/**
 * Previously assigned color.
 */

var prevColor = 0;

/**
 * Previous log timestamp.
 */

var prevTime;

/**
 * Select a color.
 *
 * @return {Number}
 * @api private
 */

function selectColor() {
  return exports.colors[prevColor++ % exports.colors.length];
}

/**
 * Create a debugger with the given `namespace`.
 *
 * @param {String} namespace
 * @return {Function}
 * @api public
 */

function debug(namespace) {

  // define the `disabled` version
  function disabled() {
  }
  disabled.enabled = false;

  // define the `enabled` version
  function enabled() {

    var self = enabled;

    // set `diff` timestamp
    var curr = +new Date();
    var ms = curr - (prevTime || curr);
    self.diff = ms;
    self.prev = prevTime;
    self.curr = curr;
    prevTime = curr;

    // add the `color` if not set
    if (null == self.useColors) self.useColors = exports.useColors();
    if (null == self.color && self.useColors) self.color = selectColor();

    var args = Array.prototype.slice.call(arguments);

    args[0] = exports.coerce(args[0]);

    if ('string' !== typeof args[0]) {
      // anything else let's inspect with %o
      args = ['%o'].concat(args);
    }

    // apply any `formatters` transformations
    var index = 0;
    args[0] = args[0].replace(/%([a-z%])/g, function(match, format) {
      // if we encounter an escaped % then don't increase the array index
      if (match === '%%') return match;
      index++;
      var formatter = exports.formatters[format];
      if ('function' === typeof formatter) {
        var val = args[index];
        match = formatter.call(self, val);

        // now we need to remove `args[index]` since it's inlined in the `format`
        args.splice(index, 1);
        index--;
      }
      return match;
    });

    if ('function' === typeof exports.formatArgs) {
      args = exports.formatArgs.apply(self, args);
    }
    var logFn = enabled.log || exports.log || console.log.bind(console);
    logFn.apply(self, args);
  }
  enabled.enabled = true;
  enabled.namespace = namespace;

  function dynamic() {
    if (!exports.enabled(namespace)) return disabled();
    return enabled.apply(enabled, arguments);
  }
  dynamic.namespace = namespace;

  function fn() {
    if (isDynamic) return dynamic;
    return exports.enabled(namespace) ? enabled : disabled;
  }

  return fn();
}

/**
 * Coerce `val`.
 *
 * @param {Mixed} val
 * @return {Mixed}
 * @api private
 */

function coerce(val) {
  if (val instanceof Error) return val.stack || val.message;
  return val;
}

/**
 * Get/set the dynamic flag
 *
 * @param {Boolean} [flag]
 * @returns {Boolean}
 */

function dynamic(flag) {
  isDynamic = !!flag;
}

},{"./able":1,"ms":3}],3:[function(require,module,exports){
/**
 * Helpers.
 */

var s = 1000;
var m = s * 60;
var h = m * 60;
var d = h * 24;
var y = d * 365.25;

/**
 * Parse or format the given `val`.
 *
 * Options:
 *
 *  - `long` verbose formatting [false]
 *
 * @param {String|Number} val
 * @param {Object} options
 * @return {String|Number}
 * @api public
 */

module.exports = function(val, options){
  options = options || {};
  if ('string' == typeof val) return parse(val);
  return options.long
    ? long(val)
    : short(val);
};

/**
 * Parse the given `str` and return milliseconds.
 *
 * @param {String} str
 * @return {Number}
 * @api private
 */

function parse(str) {
  var match = /^((?:\d+)?\.?\d+) *(ms|seconds?|s|minutes?|m|hours?|h|days?|d|years?|y)?$/i.exec(str);
  if (!match) return;
  var n = parseFloat(match[1]);
  var type = (match[2] || 'ms').toLowerCase();
  switch (type) {
    case 'years':
    case 'year':
    case 'y':
      return n * y;
    case 'days':
    case 'day':
    case 'd':
      return n * d;
    case 'hours':
    case 'hour':
    case 'h':
      return n * h;
    case 'minutes':
    case 'minute':
    case 'm':
      return n * m;
    case 'seconds':
    case 'second':
    case 's':
      return n * s;
    case 'ms':
      return n;
  }
}

/**
 * Short format for `ms`.
 *
 * @param {Number} ms
 * @return {String}
 * @api private
 */

function short(ms) {
  if (ms >= d) return Math.round(ms / d) + 'd';
  if (ms >= h) return Math.round(ms / h) + 'h';
  if (ms >= m) return Math.round(ms / m) + 'm';
  if (ms >= s) return Math.round(ms / s) + 's';
  return ms + 'ms';
}

/**
 * Long format for `ms`.
 *
 * @param {Number} ms
 * @return {String}
 * @api private
 */

function long(ms) {
  return plural(ms, d, 'day')
    || plural(ms, h, 'hour')
    || plural(ms, m, 'minute')
    || plural(ms, s, 'second')
    || ms + ' ms';
}

/**
 * Pluralization helper.
 */

function plural(ms, n, name) {
  if (ms < n) return;
  if (ms < n * 1.5) return Math.floor(ms / n) + ' ' + name;
  return Math.ceil(ms / n) + ' ' + name + 's';
}

},{}],4:[function(require,module,exports){

/**
 * This is the web browser implementation of `debug()`.
 *
 * Expose `debug()` as the module.
 */

exports = module.exports = require('./debug');
exports.log = log;
exports.formatArgs = formatArgs;
exports.save = save;
exports.load = load;
exports.useColors = useColors;

/**
 * Enabled/disabled lists management.
 */

var able = require('./able');

/**
 * Wrapped enable that saves after list modified.
 *
 * @param {String} ns
 */

exports.enable = function (ns) {
  able.enable(ns);
  save();
};

/**
 * Wrapped disable that saves after list modified.
 *
 * @param {String} ns
 */

exports.disable = function (ns) {
  able.disable(ns);
  save();
};

/**
 * Colors.
 */

exports.colors = [
  'lightseagreen',
  'forestgreen',
  'goldenrod',
  'dodgerblue',
  'darkorchid',
  'crimson'
];

/**
 * Currently only WebKit-based Web Inspectors, Firefox >= v31,
 * and the Firebug extension (any Firefox version) are known
 * to support "%c" CSS customizations.
 *
 * TODO: add a `localStorage` variable to explicitly enable/disable colors
 */

function useColors() {
  // is webkit? http://stackoverflow.com/a/16459606/376773
  return ('WebkitAppearance' in document.documentElement.style) ||
    // is firebug? http://stackoverflow.com/a/398120/376773
    (window.console && (console.firebug || (console.exception && console.table))) ||
    // is firefox >= v31?
    // https://developer.mozilla.org/en-US/docs/Tools/Web_Console#Styling_messages
    (navigator.userAgent.toLowerCase().match(/firefox\/(\d+)/) && parseInt(RegExp.$1, 10) >= 31);
}

/**
 * Map %j to `JSON.stringify()`, since no Web Inspectors do that by default.
 */

exports.formatters.j = function(v) {
  return JSON.stringify(v);
};


/**
 * Colorize log arguments if enabled.
 *
 * @api public
 */

function formatArgs() {
  var args = arguments;
  var useColors = this.useColors;

  args[0] = (useColors ? '%c' : '')
    + this.namespace
    + (useColors ? ' %c' : ' ')
    + args[0]
    + (useColors ? '%c ' : ' ')
    + '+' + exports.humanize(this.diff);

  if (!useColors) return args;

  var c = 'color: ' + this.color;
  args = [args[0], c, 'color: inherit'].concat(Array.prototype.slice.call(args, 1));

  // the final "%c" is somewhat tricky, because there could be other
  // arguments passed either before or after the %c, so we need to
  // figure out the correct index to insert the CSS into
  var index = 0;
  var lastC = 0;
  args[0].replace(/%[a-z%]/g, function(match) {
    if ('%%' === match) return;
    index++;
    if ('%c' === match) {
      // we only are interested in the *last* %c
      // (the user may have provided their own)
      lastC = index;
    }
  });

  args.splice(lastC, 0, c);
  return args;
}

/**
 * Invokes `console.log()` when available.
 * No-op when `console.log` is not a "function".
 *
 * @api public
 */

function log() {
  // This hackery is required for IE8,
  // where the `console.log` function doesn't have 'apply'
  return 'object' == typeof console
    && 'function' == typeof console.log
    && Function.prototype.apply.call(console.log, console, arguments);
}

/**
 * Save `namespaces`.
 *
 * @param {String} namespaces
 * @api private
 */

function save() {
  try {
    var namespaces = able.stringify();

    if (null == namespaces) {
      localStorage.removeItem('debug');
    } else {
      localStorage.debug = namespaces;
    }
  } catch(e) {}
}

/**
 * Load `namespaces`.
 *
 * @return {String} returns the previously persisted debug modes
 * @api private
 */

function load() {
  var r;
  try {
    r = localStorage.debug;
  } catch(e) {}
  return r;
}

/**
 * Enable namespaces listed in `localStorage.debug` initially.
 */

able.parse(load());

},{"./able":1,"./debug":2}]},{},[4])(4)
});