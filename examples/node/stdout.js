const debug = require('../../src'); // ../../src can be replaced with debug if run outside of this repository

const error = debug('app:error');

// By default stderr is used
error('goes to stderr!');

const log = debug('app:log');

// Set this namespace to log via console.log
log.log = console.log.bind(console); // Don't forget to bind to console!

log('goes to stdout');
error('still goes to stderr!');

// Set all output to go via console.info
// Overrides all per-namespace log settings
debug.log = console.info.bind(console);
error('now goes to stdout via console.info');
log('still goes to stdout, but via console.info now');
