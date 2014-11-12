
/**
 * Enabled/disabled status management
 */

var able = require('./able');

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
exports.enable = enable;
exports.disable = disable;
exports.enabled = able.enabled;


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

/**
 * Enables a string of namespaces (disables those with hyphen prefixes)
 *
 * @param {String} namespaces
 */

function enable(namespaces) {
  able.parse(namespaces).forEach(function (ns) {
    if ('-' == ns[0]) able.disable(ns.slice(1));
    else              able.enable(ns);
  });

  exports.save();
}

/**
 * Disables a string of namespaces (ignores hyphen prefixs if found)
 *
 * @param {String} namespaces
 */

function disable(namespaces) {
  able.parse(namespaces).forEach(function (ns) {
    if ('-' == ns[0]) ns = ns.slice(1);
    able.disable(ns);
  });

  exports.save();
}
