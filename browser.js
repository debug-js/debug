
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
 * Currently only WebKit-based Web Inspectors and the Firebug
 * extension (*not* the built-in Firefox web inpector) are
 * known to support "%c" CSS customizations.
 *
 * TODO: add a `localStorage` variable to explicitly enable/disable colors
 */

var useColors =
  // is webkit? http://stackoverflow.com/a/16459606/376773
  ('WebkitAppearance' in document.documentElement.style) ||
  // is firebug? http://stackoverflow.com/a/398120/376773
  (window.console && (console.firebug || (console.exception && console.table)));

/**
 * Map %j to `JSON.stringify()`, since no Web Inspectors do that by default.
 */

exports.formatters.j = function(v) {
  return JSON.stringify(v);
};

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

function log() {
  var args = arguments;
  var curr = new Date();
  var ms = curr - (this.prev || curr);
  this.prev = curr;

  args[0] = (useColors ? '%c' : '')
    + this.namespace
    + (useColors ? '%c ' : ' ')
    + args[0]
    + (useColors ? '%c ' : ' ')
    + '+' + exports.humanize(ms);

  if (useColors) {
    if (null == this.c) this.c = selectColor();
    var c = 'color: ' + this.c;
    args = [args[0], c, ''].concat(Array.prototype.slice.call(args, 1));

    // the final "%c" is somewhat tricky, because there could be other
    // arguments passed either before or after the %c, so we need to
    // figure out the correct index to insert the CSS into
    var index = 0;
    args[0].replace(/%[a-z%]/g, function(match) {
      if ('%%' === match) return;
      index++;
      if (index < 3) return; // skip the first 2 %c's since that's handled already
      if ('%c' === match) {
        args.splice(index, 0, c);
      }
    });
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
