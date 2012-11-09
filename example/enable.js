var mod = require('..');
var debug = mod('test:x');
debug('x1'); // not enabled
mod.enable('test:x');
debug('x2'); // printed out
mod.enable('-test:*');
debug('x3'); // skipped
mod.disable('-test:*');
debug('x4'); // printed out
mod.disable('test:x');
debug('x5'); // not enabled