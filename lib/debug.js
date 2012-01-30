
/*!
 * debug
 * Copyright(c) 2012 TJ Holowaychuk <tj@vision-media.ca>
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

exports.version = '0.3.0';

/**
 * Enabled debuggers.
 */

var names = (process.env.DEBUG || '')
  .split(/[\s,]+/)
  .map(function(name){
    name = name.replace('*', '.*?');
    return new RegExp('^' + name + '$');
  });

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

var isatty = tty.isatty(1);

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
  var match = names.some(function(re){
    return re.test(name);
  });

  if (!match) return function(){};
  var c = color();

  function colored(fmt) {
    var curr = new Date;
    var ms = curr - (prev[name] || curr);
    prev[name] = curr;

    fmt = '  \033[9' + c + 'm' + name + ' '
      + '\033[3' + c + 'm+' + ms + 'ms\033[90m '
      + fmt + '\033[0m';

    console.log.apply(this, arguments);
  }

  function plain(fmt) {
    fmt = new Date().toUTCString()
      + ' ' + name + ' ' + fmt;
    console.log.apply(this, arguments);
  }

  return isatty ? colored : plain;
}
