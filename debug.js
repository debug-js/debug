
/*!
 * debug
 * Copyright(c) 2012 TJ Holowaychuk <tj@vision-media.ca>
 * MIT Licensed
 */

/**
 * Enabled debuggers.
 */

var names = (localStorage.debug || '')
  .split(/[\s,]+/)
  .map(function(name){
    name = name.replace('*', '.*?');
    return new RegExp('^' + name + '$');
  });

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
  var match = names.some(function(re){
    return re.test(name);
  });

  if (!match) return function(){};

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
