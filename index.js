if ('undefined' == typeof window) {
  module.exports = require('./debug');
} else {
  module.exports = require('./lib/debug');
}
