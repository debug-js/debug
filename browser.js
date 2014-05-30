
/**
 * This is the web browser implementation of `debug()`.
 *
 * Expose `debug()` as the module.
 */

exports = module.exports = require('./debug');
exports.log = log;
exports.save = save;
exports.load = load;

/**
 * Invokes `console.log()` when available.
 * No-op when `console.log` is not a "function".
 *
 * @api public
 */

function log(fmt) {
  var curr = new Date();
  var ms = curr - (this.prev || curr);
  this.prev = curr;

  fmt = name
    + ' '
    + fmt
    + ' +' + exports.humanize(ms);

  // This hackery is required for IE8,
  // where the `console.log` function doesn't have 'apply'
  return 'object' == typeof console
    && 'function' == typeof console.log
    && Function.prototype.apply.call(console.log, console, arguments);
}

/**
 * Save `namespaces`.
 *
 * @param {String} namespaces
 * @api private
 */

function save(namespaces) {
  try {
    localStorage.debug = namespaces;
  } catch(e) {}
}

/**
 * Load `namespaces`.
 *
 * @return {String} returns the previously persisted debug modes
 * @api private
 */

function load() {
  var r = '';
  try {
    r = localStorage.debug || '';
  } catch(e) {}
  return r;
}

/**
 * Enable namespaces listed in `localStorage.debug` initially.
 */

exports.enable(load());
