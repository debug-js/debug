
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
 * Colors.
 */

var colors = [
  'cyan',
  'green',
  'goldenrod', // "yellow" is just too bright on a white background...
  'blue',
  'purple',
  'red'
];

/**
 * Previously assigned color.
 */

var prevColor = 0;

/**
 * Currently only WebKit-based Web Inspectors are known
 * to support "%c" CSS customizations.
 */

var useColors = 'WebkitAppearance' in document.documentElement.style;

/**
 * Select a color.
 *
 * @return {Number}
 * @api private
 */

function selectColor() {
  return colors[prevColor++ % colors.length];
}

/**
 * Invokes `console.log()` when available.
 * No-op when `console.log` is not a "function".
 *
 * @api public
 */

function log(fmt) {
  var args = arguments;
  var curr = new Date();
  var ms = curr - (this.prev || curr);
  this.prev = curr;

  fmt = (useColors ? '%c' : '')
    + this.namespace
    + (useColors ? '%c ' : ' ')
    + fmt
    + (useColors ? '%c ' : ' ')
    + '+' + exports.humanize(ms);

  if (useColors) {
    if (null == this.c) this.c = selectColor();
    var c = 'color: ' + this.c;
    args = [args[0], c, ''].concat(Array.prototype.slice.call(arguments, 1));
    args.push(c);
  }

  // This hackery is required for IE8,
  // where the `console.log` function doesn't have 'apply'
  return 'object' == typeof console
    && 'function' == typeof console.log
    && Function.prototype.apply.call(console.log, console, args);
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
  var r;
  try {
    r = localStorage.debug;
  } catch(e) {}
  return r;
}

/**
 * Enable namespaces listed in `localStorage.debug` initially.
 */

exports.enable(load());
