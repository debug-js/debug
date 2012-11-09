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

var names = []
  , skips = []
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
 * @param {Number} m
 * @return {String}
 * @api private
 */

function humanize(ms) {
  var sec = 1000
    , min = 60 * 1000
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
    // check if skips/names has been updated since caching
    if (this.enabled_cache_id === undefined || this.enabled_cache_id < enabled_cache_id) {
      this.enabled = undefined;
    }

    // check if has a cached enabled value, update if necessary
    if (this.enabled === undefined) {
      this.enabled = names.some(function(re){ return re.test(name); }) && !skips.some(function(re){ return re.test(name); });
      this.enabled_cache_id = enabled_cache_id;
    }

    // if disabled, then noop
    if (this.enabled === false) return;

    colored.enabled = plain.enabled = true;

    var printer = isatty || process.env.DEBUG_COLORS
      ? colored
      : plain;

    printer.apply(this, arguments);
  };

  function colored(fmt) {
    var curr = new Date;
    var ms = curr - (prev[name] || curr);
    prev[name] = curr;

    fmt = '  \033[9' + c + 'm' + name + ' '
      + '\033[3' + c + 'm\033[90m'
      + fmt + '\033[3' + c + 'm'
      + ' +' + humanize(ms) + '\033[0m';

    console.error.apply(this, arguments);
  }

  function plain(fmt) {
    fmt = new Date().toUTCString()
      + ' ' + name + ' ' + fmt;
    console.error.apply(this, arguments);
  }
}

debug.enable = function(name) {
  var split = (name || '').split(/[\s,]+/)
    , len = split.length;

  for (var i = 0; i < len; i++) {
    name = split[i].replace('*', '.*?');
    if (name[0] === '-') {
      skips.push(new RegExp('^' + name.substr(1) + '$'));
    }
    else {
      names.push(new RegExp('^' + name + '$'));
    }
  }

  enabled_cache_id++;
};

debug.disable = function() {
  debug.enable('');
};

debug.enable(process.env.DEBUG || '');