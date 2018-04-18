var exports = require('./browser');
var browserLoad = exports.load;

// If debug isn't set in LS, and we're in Electron, try to load $DEBUG
exports.load = function load() {
  var r = browserLoad();
  if (!r && 'env' in process) {
    r = process.env.DEBUG;
  }
  return r;
};

module.exports = require('./common')(exports);

var formatters = module.exports.formatters;

/**
 * Map %j to `JSON.stringify()`, since no Web Inspectors do that by default.
 */

formatters.j = function (v) {
  try {
    return JSON.stringify(v);
  } catch (err) {
    return '[UnexpectedJSONParseError]: ' + err.message;
  }
};