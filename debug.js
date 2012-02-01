
/*!
 * debug
 * Copyright(c) 2012 TJ Holowaychuk <tj@vision-media.ca>
 * MIT Licensed
 */

/**
 * The currently active debug mode names.
 */

var names = [];

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
  var enabled = debug.enabled(name);

  if (!enabled) return function(){};

  function plain(fmt) {
    var curr = new Date;
    var ms = curr - (prev[name] || curr);
    prev[name] = curr;

    fmt = name
      + ' '
      + fmt
      + ' ' + debug.pad(ms, 40 - fmt.length)
      + 'ms';

    // This hackery is required for IE8, where `console.log` doesn't have 'apply'
    window.console && console.log &&
      Function.prototype.apply.call(console.log, console, arguments);
  }

  return plain;
}

/**
 * Pad the given `str` to `len`.
 * 
 * @param {String} str
 * @param {String} len
 * @return {String}
 * @api private
 */

debug.pad = function(str, len) {
  return Array(Math.max(len, 1)).join(' ') + str;
};

/**
 * Enables a debug mode by name. This can include modes
 * separated by a colon and wildcards.
 *
 * @param {String} name
 * @api public
 */

debug.enable = function(name) {
  var split = (name || '').split(/[\s,]+/)
    , len = split.length;
  for (var i=0; i<len; i++) {
    name = split[i].replace('*', '.*?');
    names.push(new RegExp('^' + name + '$'));
  }
};

/**
 * Returns true if the given mode name is enabled, false otherwise.
 *
 * @param {String} name
 * @return {Boolean}
 * @api public
 */

debug.enabled = function(name) {
  for (var i=0, l=names.length; i<l; i++) {
    if (names[i].test(name)) {
      return true;
    }
  }
  return false;
};
