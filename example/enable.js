var mod = require('..');
var debug = mod('test');
debug('x');
mod.enable('test');
debug('x2');
mod.disable();
debug('x3');