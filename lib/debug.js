
/*!
 * debug
 * Copyright(c) 2011 TJ Holowaychuk <tj@vision-media.ca>
 * MIT Licensed
 */

/**
 * Module dependencies.
 */

var tty = require('tty');

/**
 * Expose `debug()` as the module.
 */

module.exports = debug;

/**
 * Library version.
 */

exports.version = '0.1.0';

/**
 * Enabled debuggers.
 */

var names = (process.env.DEBUG || '').split(/[\s,]+/);

/**
 * Colors.
 */

var colors = [6, 2, 3, 4, 5, 1];

/**
 * Previously assigned color.
 */

var prevColor = 0;

/**
 * Is stderr a TTY? Colored output is disabled when `true`.
 */

var isatty = tty.isatty(process.stderr.fd || 2);

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
 * Create a debugger with the given `name`.
 *
 * @param {String} name
 * @return {Type}
 * @api public
 */

function debug(name) {
  if (!~names.indexOf(name)) return function(){};
  var c = color();

  function colored(fmt) {
    fmt = '  \033[3' + c + 'm' + name + '\033[90m ' + fmt + '\033[0m';
    console.error.apply(this, arguments);
  }

  function plain(fmt) {
    fmt = '  ' + name + ' ' + fmt;
    console.error.apply(this, arguments);
  }

  return isatty ? colored : plain;
}
