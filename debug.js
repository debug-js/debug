
/*!
 * debug
 * Copyright(c) 2012 TJ Holowaychuk <tj@vision-media.ca>
 * MIT Licensed
 */

/**
 * Previous debug() call.
 */

var prev = {};

/**
 * Create a debugger with the given `name`.
 *
 * @param {String} name
 * @return {Type}
 * @api public
 */

function debug(name) {
  if (!debug.enable) {
    throw new Error('You must set a function for `debug.enable`');
  }

  var enabled = debug.enable(name);

  if (!enabled) return function(){};

  function plain(fmt) {
    var curr = new Date;
    var ms = curr - (prev[name] || curr);
    prev[name] = curr;

    fmt = name
      + ' +' + ms + 'ms '
      + fmt;

    console.log.apply(console, arguments);
  }

  return plain;
}
