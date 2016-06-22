if (process.versions.electron) {
  if (process.type === 'renderer') {
    module.exports = require('./browser-console');
  } else {
    // TODO (imlucas) nslog etc. as we're in the main process.
    module.exports = require('./stream');
  }
} else if (typeof window !== 'undefined') {
  module.exports = require('./browser-console');
} else {
  module.exports = require('./stream');
}
