
/**
 * This is the web browser implementation of `debug()`.
 *
 * Expose `debug()` as the module.
 */
exports = module.exports = require('./common');

/* global chrome, window, document, navigator */
var chromeStorage = typeof chrome !== 'undefined' && typeof chrome.storage !== 'undefined';

/**
 * Localstorage attempts to return the localstorage.
 *
 * This is necessary because safari throws
 * when a user disables cookies/localstorage
 * and you attempt to access it.
 *
 * @return {LocalStorage}
 * @api private
 */

function localstorage() {
  try {
    return window.localStorage;
  } catch (e) {
    return null;
  }
}

exports.storage = chromeStorage ? chrome.storage.local : localstorage();

/**
 * Colors.
 */

exports.colors = [
  'lightseagreen',
  'forestgreen',
  'goldenrod',
  'dodgerblue',
  'darkorchid',
  'crimson'
];

exports.useColors = true;

/**
 * Map %j to `JSON.stringify()`, since no Web Inspectors do that by default.
 */
exports.formatters.j = function(v) {
  return JSON.stringify(v);
};


/**
 * Colorize log arguments if enabled.
 *
 * @api public
 */

exports.formatArgs = function formatArgs() {
  var args = arguments;

  args[0] = '%c'
  + this.namespace
  + ' %c'
  + args[0]
  + '%c '
  + '+' + exports.humanize(this.diff);

  var c = 'color: ' + this.color;
  args = [args[0], c, 'color: inherit'].concat(Array.prototype.slice.call(args, 1));

  // the final "%c" is somewhat tricky, because there could be other
  // arguments passed either before or after the %c, so we need to
  // figure out the correct index to insert the CSS into
  var index = 0;
  var lastC = 0;
  args[0].replace(/%[a-z%]/g, function(match) {
    if (match === '%%') {
      return;
    }
    index++;
    if (match === '%c') {
      // we only are interested in the *last* %c
      // (the user may have provided their own)
      lastC = index;
    }
  });

  args.splice(lastC, 0, c);
  return args;
}

/**
 * Invokes `console.log()` when available.
 * No-op when `console.log` is not a "function".
 *
 * @api public
 */

exports.log = function log() {
  /* eslint no-console: 0 */
  debugger;
  return Function.prototype.apply.call(console.log, console, arguments);
}

/**
 * Save `namespaces`.
 *
 * @param {String} namespaces
 * @api private
 */

exports.save = function save(namespaces) {
  try {
    if (namespaces === null) {
      exports.storage.removeItem('debug');
    } else {
      exports.storage.debug = namespaces;
    }
  } catch (e) {
    console.error(e);
  }
}

/**
 * Load `namespaces`.
 *
 * @return {String} returns the previously persisted debug modes
 * @api private
 */

exports.load = function load() {
  var r;
  try {
    r = exports.storage.debug;
  } catch (e) {
    console.error(e);
  }
  return r;
}

/**
 * Enable namespaces listed in `localStorage.debug` initially.
 */

exports.enable(exports.load());
