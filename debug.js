
/**
 * Expose `debug()` as the module.
 */

module.exports = debug;

/**
 * Create a debugger with the given `name`.
 *
 * @param {String} name
 * @return {Type}
 * @api public
 */

function debug(name) {
  function letNarrow(fn) {
    // to a given function `fn` adds a method `.narrow`
    // this method takes a `suffix` argument
    // and returns a copy of the `fn` with `suffix` appended `name`.
    // additionaly adds .name property
    // and .root property, which holds function created without .narrow

    fn.scope = name
    if (typeof root == "function") fn.root = root
    else fn.root = fn
    // fn.root = root // a function created with call to debug(), not .narrow()

    fn.narrow = function (suffix) {
      var scope = this.scope ? this.scope + ":" : "";
      scope    += suffix
      return debug(scope, fn.root)
    };
  }
  var fn;

  if (debug.enabled(name)) {
    fn = function(fmt){
      fmt = coerce(fmt);

      var curr = new Date;
      var ms = curr - (debug[name] || curr);
      debug[name] = curr;

      fmt = name
        + ' '
        + fmt
        + ' +' + debug.humanize(ms);

      // This hackery is required for IE8
      // where `console.log` doesn't have 'apply'
      window.console
        && console.log
        && Function.prototype.apply.call(console.log, console, arguments);
    };
  }
  else fn = function() {};

  letNarrow(fn);

  return fn;
}

/**
 * The currently active debug mode names.
 */

debug.names = [];
debug.skips = [];

/**
 * Enables a debug mode by name. This can include modes
 * separated by a colon and wildcards.
 *
 * @param {String} name
 * @api public
 */

debug.enable = function(name) {
  try {
    localStorage.debug = name;
  } catch(e){}

  var split = (name || '').split(/[\s,]+/)
    , len = split.length;

  for (var i = 0; i < len; i++) {
    name = split[i].replace('*', '.*?');
    if (name[0] === '-') {
      debug.skips.push(new RegExp('^' + name.substr(1) + '$'));
    }
    else {
      debug.names.push(new RegExp('^' + name + '$'));
    }
  }
};

/**
 * Disable debug output.
 *
 * @api public
 */

debug.disable = function(){
  debug.enable('');
};

/**
 * Humanize the given `ms`.
 *
 * @param {Number} m
 * @return {String}
 * @api private
 */

debug.humanize = function(ms) {
  var sec = 1000
    , min = 60 * 1000
    , hour = 60 * min;

  if (ms >= hour) return (ms / hour).toFixed(1) + 'h';
  if (ms >= min) return (ms / min).toFixed(1) + 'm';
  if (ms >= sec) return (ms / sec | 0) + 's';
  return ms + 'ms';
};

/**
 * Returns true if the given mode name is enabled, false otherwise.
 *
 * @param {String} name
 * @return {Boolean}
 * @api public
 */

debug.enabled = function(name) {
  for (var i = 0, len = debug.skips.length; i < len; i++) {
    if (debug.skips[i].test(name)) {
      return false;
    }
  }
  for (var i = 0, len = debug.names.length; i < len; i++) {
    if (debug.names[i].test(name)) {
      return true;
    }
  }
  return false;
};

/**
 * Coerce `val`.
 */

function coerce(val) {
  if (val instanceof Error) return val.stack || val.message;
  return val;
}

// persist

try {
  if (window.localStorage) debug.enable(localStorage.debug);
} catch(e){}
