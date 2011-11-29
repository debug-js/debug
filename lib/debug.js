
/*!
 * debug
 * Copyright(c) 2011 TJ Holowaychuk <tj@vision-media.ca>
 * MIT Licensed
 */

/**
 * Expose `debug()` as the module.
 */

module.exports = debug;

/**
 * Library version.
 */

exports.version = '0.0.1';

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
  return function(fmt){
    fmt = '  \033[3' + c + 'm' + name + '\033[90m ' + fmt + '\033[0m';
    console.error.apply(this, arguments);
  }
}