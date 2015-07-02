
/**
 * This is the common logic for both the Node.js and web browser
 * implementations of `debug()`.
 *
 * Expose `debug()` as the module.
 */

exports = module.exports = debug;
exports.coerce = coerce;
exports.disable = disable;
exports.enable = enable;
exports.enabled = enabled;
exports.humanize = require('ms');

/**
 * The currently active debug mode names, and names to skip.
 */

exports.names = [];
exports.skips = [];

/**
 * Map of special "%n" handling functions, for the debug "format" argument.
 *
 * Valid key names are a single, lowercased letter, i.e. "n".
 */

exports.formatters = {};

/**
 * Container for dynamic debug instances.
 */

exports.dynamics = {};

/**
 * Dynamic debug instances counter.
 */

var dynamicCounter = 0;

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
 * @param {[Boolean]} isDynamic
 * @return {Function}
 * @api public
 */

function debug(namespace, isDynamic) {
  // Return a non dynamic debug instance.
  if (!isDynamic) {
    // define the `disabled` version
    function disabled() {
    }
    disabled.enabled = false;

    // define the `enabled` version
    function enabled() {
      // set `diff` timestamp
      var curr = +new Date();
      var ms = curr - (prevTime || curr);
      enabled.diff = ms;
      enabled.prev = prevTime;
      enabled.curr = curr;
      prevTime = curr;

      // add the `color` if not set
      if (null == enabled.useColors) enabled.useColors = exports.useColors();
      if (null == enabled.color && enabled.useColors) enabled.color = selectColor();

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
          match = formatter.call(enabled, val);

          // now we need to remove `args[index]` since it's inlined in the `format`
          args.splice(index, 1);
          index--;
        }
        return match;
      });

      if ('function' === typeof exports.formatArgs) {
        args = exports.formatArgs.apply(enabled, args);
      }
      var logFn = enabled.log || exports.log || console.log.bind(console);
      logFn.apply(enabled, args);
    }
    enabled.enabled = true;

    var fn = exports.enabled(namespace) ? enabled : disabled;

    fn.namespace = namespace;

    // Fake release() method.
    fn.release = function() {};

    return fn;
  }

  // Return a dynamic debug instance.
  else {
    function dynamic() {
      if (!dynamic.enabled) {
        return;
      }

      // set `diff` timestamp
      var curr = +new Date();
      var ms = curr - (prevTime || curr);
      dynamic.diff = ms;
      dynamic.prev = prevTime;
      dynamic.curr = curr;
      prevTime = curr;

      // add the `color` if not set
      if (null == dynamic.useColors) dynamic.useColors = exports.useColors();
      if (null == dynamic.color && dynamic.useColors) dynamic.color = selectColor();

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
          match = formatter.call(dynamic, val);

          // now we need to remove `args[index]` since it's inlined in the `format`
          args.splice(index, 1);
          index--;
        }
        return match;
      });

      if ('function' === typeof exports.formatArgs) {
        args = exports.formatArgs.apply(dynamic, args);
      }
      var logFn = dynamic.log || exports.log || console.log.bind(console);
      logFn.apply(dynamic, args);
    }

    dynamic.enabled = exports.enabled(namespace);
    dynamic.namespace = namespace;

    // Append to the container-
    var idx = dynamicCounter++;
    exports.dynamics[idx] = dynamic;

    // Set release() method.
    dynamic.release = function() {
      delete exports.dynamics[idx];
    };

    return dynamic;
  }
}

/**
 * Enables a debug mode by namespaces. This can include modes
 * separated by a colon and wildcards.
 *
 * @param {String} namespaces
 * @api public
 */

function enable(namespaces) {
  exports.save(namespaces);

  // Reset names and skips.
  exports.names = [];
  exports.skips = [];

  var split = (namespaces || '').split(/[\s,]+/);
  var len = split.length;

  for (var i = 0; i < len; i++) {
    if (!split[i]) continue; // ignore empty strings
    namespaces = split[i].replace(/\*/g, '.*?');
    if (namespaces[0] === '-') {
      exports.skips.push(new RegExp('^' + namespaces.substr(1) + '$'));
    } else {
      exports.names.push(new RegExp('^' + namespaces + '$'));
    }
  }

  // Update dynamic debug instances.
  updateDynamics();
}

/**
 * Disable debug output.
 *
 * @api public
 */

function disable() {
  // Clear stored namespaces.
  exports.save(null);

  // Reset names and skips.
  exports.names = [];
  exports.skips = [];

  // Update dynamic debug instances.
  updateDynamics(true);
}

/**
 * Returns true if the given mode name is enabled, false otherwise.
 *
 * @param {String} name
 * @return {Boolean}
 * @api public
 */

function enabled(name) {
  var i, len;
  for (i = 0, len = exports.skips.length; i < len; i++) {
    if (exports.skips[i].test(name)) {
      return false;
    }
  }
  for (i = 0, len = exports.names.length; i < len; i++) {
    if (exports.names[i].test(name)) {
      return true;
    }
  }
  return false;
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
 * Update dynamic debug instances.
 *
 * @param {[Boolean]} disableAll
 * @api private
 */

function updateDynamics(disableAll) {
  var idx, dynamic;

  for (idx in exports.dynamics) {
    if (exports.dynamics.hasOwnProperty(idx)) {
      dynamic = exports.dynamics[idx];

      if (!disableAll) {
        dynamic.enabled = exports.enabled(dynamic.namespace);
      } else {
        dynamic.enabled = false;
      }
    }
  }
}
