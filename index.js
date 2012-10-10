if (typeof window != 'undefined') {
  module.exports = require('./debug');
} else {
  module.exports = require('./lib/debug');
}