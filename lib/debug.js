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

/**
 * Create a debugger with the given `name`.
 *
 * @param {String} name
 * @return {Function}
 * @api public
 */

function debug(name) {
  var c = color();

  return function() {
    // invalidate `enabled` if skips/names has been updated
    if (this.enabled_cache_id === undefined || this.enabled_cache_id < enabled_cache_id) {
      this.enabled = undefined;
    }

    // check if has a cached enabled value, set if necessary
    if (this.enabled === undefined) {
      this.enabled_cache_id = enabled_cache_id;
      this.enabled = debug.isEnabled(name);
    }

    // if disabled, then noop
    if (this.enabled === false) return;

    var printer = isatty || process.env.DEBUG_COLORS
      ? colored
      : plain;

    printer.apply(this, arguments);
  };

  function colored(fmt) {
    var curr = Date.now();
    var ms = curr - (prev[name] || curr);
    prev[name] = curr;

    fmt = '  \033[9' + c + 'm' + name + ' '
      + '\033[3' + c + 'm\033[90m'
      + fmt + '\033[3' + c + 'm'
      + ' +' + humanize(ms) + '\033[0m';

    printer.apply(this, arguments);
  }

  function plain(fmt) {
    fmt = new Date().toUTCString()
      + ' ' + name + ' ' + fmt;
    printer.apply(this, arguments);
  }
}

debug.enable = function (name) {
  var split = (name || '').split(/[\s,]+/)
    , len = split.length;

  for (var i = 0; i < len; i++) {
    name = split[i].replace('*', '.*?');
    if (name[0] === '-') {
      var reStr = '^' + name.substr(1) + '$';
      skips[reStr] = new RegExp(reStr);
    }
    else {
      var reStr = '^' + name + '$';
      names[reStr] = new RegExp(reStr);
    }
  }

  enabled_cache_id++;
};

debug.disable = function (name) {
  var split = (name || '').split(/[\s,]+/)
    , len = split.length;

  for (var i = 0; i < len; i++) {
    name = split[i].replace('*', '.*?');
    if (name[0] === '-') {
      var reStr = '^' + name.substr(1) + '$';
      delete skips[reStr];
    }
    else {
      var reStr = '^' + name + '$';
      delete names[reStr];
    }
  }

  enabled_cache_id++;
};

debug.isEnabled = function (name) {
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

debug.enable(process.env.DEBUG || '');