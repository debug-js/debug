
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
  , showPID = false;

(process.env.DEBUG || '')
  .split(/[\s,]+/)
  .forEach(function(name){
    name = name.replace('*', '.*?');
    if (name[0] === '-') {
      skips.push(new RegExp('^' + name.substr(1) + '$'));
    } else {
      if (name == 'PID') {
        showPID = true;
      } else {
        names.push(new RegExp('^' + name + '$'));
      }
    }
  });

function isEnabled(name) {
  var disabled = skips.some(function(re) {
    return re.test(name);
  });
  if (disabled) return false;
  return names.some(function(re) {
    return re.test(name);
  });
}


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

function c3(c) {
  return '\033[3' + c + 'm';
}

function c9(c) {
  return '\033[9' + c + 'm';
}

var clearColor = '\033[0m';

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
 * @return {Type}
 * @api public
 */

function debug(name, kind, kindColor) {
  var log = function disabled(){}

  if (isEnabled(name) || (kind && isEnabled(kind + ':' + name))) {

    if (isatty) {
      var c = color()
        , pid = showPID ? c9(Number(process.pid) % 7) + process.pid + ' ' + c9(0) : ''
        , knd = kind ? c9(kindColor) + kind + ' ' + c9(0) : ''
        , pre = '  ' + pid + knd + c9(c) + name + ' ' + c3(c) + c9(0)
        , post = ' ' + c3(c) + c9(c) + '+'

      log = function colored(fmt) {
        var curr = new Date;
        var ms = curr - (prev[name] || curr);
        prev[name] = curr;

        fmt = new Date().toISOString() + pre + fmt + post + humanize(ms) + clearColor;
        console.error.apply(this, arguments);
      }
    } else {
      var pid = showPID ? process.pid + ' ' : ''
        , knd = kind ? kind + ' ' : ''
        , pre = pid + knd
        , post = ' ' + name + ' '

      log = function plain(fmt) {
        fmt = pre + new Date().toISOString() + post + fmt;
        console.error.apply(this, arguments);
      }
    }

    log.enabled = true;
  }

  if (!kind) {
    log.error = debug(name, 'ERROR', 1);
    log.debug = debug(name, 'DEBUG', 2);
    log.warn  = debug(name, 'WARN',  3);
    log.info  = debug(name, 'INFO',  4)
  }

  return log;
}

if (!Date.prototype.toISOString) {
  (function() {
    function pad(number) {
      var r = String(number);
      if (r.length === 1) {
        r = '0' + r;
      }
      return r;
    }
    Date.prototype.toISOString = function() {
      return this.getUTCFullYear()
        + '-' + pad( this.getUTCMonth() + 1 )
        + '-' + pad( this.getUTCDate() )
        + 'T' + pad( this.getUTCHours() )
        + ':' + pad( this.getUTCMinutes() )
        + ':' + pad( this.getUTCSeconds() )
        + '.' + String( (this.getUTCMilliseconds()/1000).toFixed(3) ).slice( 2, 5 )
        + 'Z';
    };
  }());
}
