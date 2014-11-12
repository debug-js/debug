/**
 * in-memory cache
 */

var enabled = [];
var disabled = [];

/**
 * Checks if the specified `ns` is enabled.
 *
 * @param {String} ns  Wildcards are not supported here
 * @returns {Boolean}
 */

exports.enabled = function (ns) {
  if (find(disabled, ns, true) > -1) return false;
  if (find(enabled, ns, true) > -1) return true;
  return false;
};

/**
 * Destroys the lists of enabled/disabled. (primarilly for testing purposes)
 */

exports.clear = function () {
  disabled.length = enabled.length = 0; // truncates w/o destroying
};

/**
 * Outputs the list of enable/disabled in a single string.
 *
 * @returns {String}
 */

exports.stringify = function () {
  var e = enabled.map(function (item) {
    return item.string;
  });

  var d = disabled.map(function (item) {
    return '-' + item.string;
  });

  return e.concat(d).join(',');
};

/**
 * Parses a list and enables/disables accordingly.
 *
 * This list can either be passed from the user directly, or from .stringify()
 *
 * @param {String} str
 */

exports.parse = function (str) {
  if (!str) return [];
  return (str || '').trim().split(/[\s,]+/).filter(function (item) {
    return !!item;
  });
};

/**
 * Enables the specified `ns`.
 *
 * @param {String} ns
 */

exports.enable = function (ns) {
  // special case, empty the current list and allow it to append
  if ('*' == ns) exports.clear();

  prune(disabled, ns);
  if (find(enabled, ns) > -1) return;

  enabled.push({
    string: ns,
    regex: regex(ns)
  });
};

/**
 * Disables the specified `ns`.
 *
 * @param {String} ns
 */

exports.disable = function (ns) {
  // special case, empty the current list (since default is to allow nothing)
  if ('*' == ns) return exports.clear();

  prune(enabled, ns);
  if (find(disabled, ns) > -1) return;

  disabled.push({
    string: ns,
    regex: regex(ns)
  });
};

/**
 * Searches for the given `ns` in the `arr`.
 *
 * By default, it only matches on the raw string, but if `regex` is set, it will
 * match via the `RegExp` instead.
 *
 * Returns the index of the match, or -1 if not found.
 *
 * @param {Array} arr
 * @param {String} ns
 * @param {Boolean} [regex]
 * @returns {Number}
 */

function find(arr, ns, regex) {
  var ret = -1;
  arr.some(function (item, x) {
    if (regex ? item.regex.test(ns) : ns === item.string) {
      ret = x;
      return true;
    }
  });
  return ret;
}

/**
 * Wraps around `find(...)`, but also removes the found item.
 *
 * @param {Array} arr
 * @param {String} ns
 * @param {Boolean} [regex]
 */

function prune(arr, ns, regex) {
  var x = find(arr, ns, regex);
  if (x > -1) arr.splice(x, 1);
}

/**
 * Converts a raw `ns` into a `RegExp`.
 *
 * @param {String} ns
 * @returns {RegExp}
 */

function regex(ns) {
  var pattern = ns.replace(/\*/g, '.*?');
  return new RegExp('^' + pattern + '$');
}
