var debug = require('../');
var log = debug('app:log');

// by default console.log is used
log('goes to stdout!');

var error = debug('app:error');
// set this namespace to log via console.error
error.log = console.error.bind(console); // don't forget to bind to console!
error('goes to stderr');
log('still goes to stdout!');

// set all output to go via console.warn
// overrides all per-namespace log settings
debug.log = console.warn.bind(console);
log('now goes to stderr via console.warn');
error('still goes to stderr, but via console.warn now');
