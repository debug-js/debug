"use strict";

/**
 * Module dependencies.
 */

var tty = require('tty');

/**
 * Expose `debug()` as the module.
 */

module.exports = debug;

/**
 * Enabled debuggers.
 */

var names = Object.create(null)
  , skips = Object.create(null)
  , enabled_cache_id = 1;

/**
 * Colors.
 */

var colors = [6, 2, 3, 4, 5, 1];

/**
 * Previous debug() call.
 */

var prev = {};

/**
 * Previously assigned color.
 */

var prevColor = 0;

/**
 * Is stdout a TTY? Colored output is disabled when `true`.
 */

var isatty = tty.isatty(2);

/**
 * Printer
 * @type {Function}
 */

var printer = console.error;

/**
 * Formatter for colorizing output
 * @type {Function}
 */

var formatter = isatty || process.env.DEBUG_COLORS
  ? colored
  : plain;

/**
 * Select a color.
 *
 * @return {Number}
 * @api private
 */

function color() {
  return colors[prevColor++ % colors.length];
}

/**
 * Humanize the given `ms`.
 *
 * @param {Number} ms
 * @return {String}
 * @api private
 */

function humanize(ms) {
  var sec = 1000
    , min = 60 * sec
    , hour = 60 * min;

  if (ms >= hour) return (ms / hour).toFixed(1) + 'h';
  if (ms >= min) return (ms / min).toFixed(1) + 'm';
  if (ms >= sec) return (ms / sec | 0) + 's';
  return ms + 'ms';
}

function colored(name, c, args) {
  var curr = Date.now();
  var ms = curr - (prev[name] || curr);
  prev[name] = curr;

  args[0] = '  \u001b[9' + c + 'm' + name + ' '
    + '\u001b[3' + c + 'm\u001b[90m'
    + args[0] + '\u001b[3' + c + 'm'
    + ' +' + humanize(ms) + '\u001b[0m';

  printer.apply(this, args);
}

function plain(name, c, args) {
  args[0] = new Date().toUTCString()
    + ' ' + name + ' ' + args[0];
  printer.apply(this, args);
}

/**
 * Create a debugger with the given `name`.
 *
 * @param {String} name
 * @return {Function}
 * @api public
 */

function debug(name) {
  var c = color()
    , this_enabled_cache_id
    , this_enabled;
  return function() {
    // invalidate `enabled` if skips/names has been updated
    if (this_enabled_cache_id === undefined || this_enabled_cache_id < enabled_cache_id) {
      this_enabled = undefined;
    }

    // check if has a cached enabled value, set if necessary
    if (this_enabled === undefined) {
      this_enabled_cache_id = enabled_cache_id;
      this_enabled = debug.enabled(name);
    }

    // if disabled, then noop
    if (this_enabled === false) return;

    formatter(name, c, arguments);
  };
}

debug.enable = function (name) {
  var split = (name || '').split(/[\s,]+/)
    , len = split.length
    , reStr;

  for (var i = 0; i < len; i++) {
    name = split[i].replace('*', '.*?');
    if (name[0] === '-') {
      reStr = '^' + name.substr(1) + '$';
      skips[reStr] = new RegExp(reStr);
    }
    else {
      reStr = '^' + name + '$';
      names[reStr] = new RegExp(reStr);
    }
  }

  enabled_cache_id++;
};

debug.disable = function (name) {
  var split = (name || '').split(/[\s,]+/)
    , len = split.length
    , reStr;

  for (var i = 0; i < len; i++) {
    name = split[i].replace('*', '.*?');
    if (name[0] === '-') {
      reStr = '^' + name.substr(1) + '$';
      delete skips[reStr];
    }
    else {
      reStr = '^' + name + '$';
      delete names[reStr];
    }
  }

  enabled_cache_id++;
};

/**
 * Returns true if the given mode name is enabled, false otherwise.
 *
 * @param {String} name
 * @return {Boolean}
 * @api public
 */

debug.enabled = function (name) {
  var reStr;
  for (reStr in skips) {
    if (skips[reStr].test(name)) {
      return false;
    }
  }
  for (reStr in names) {
    if (names[reStr].test(name)) {
      return true;
    }
  }
  return false;
};

debug.setPrinter = function (f) {
  printer = f;
};

debug.setFormatter = function (f) {
  formatter = f;
};

debug.enable(process.env.DEBUG || '');
