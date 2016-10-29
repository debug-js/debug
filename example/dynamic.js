process.env.DEBUG = '*';


var debug = require('../');


var dyndebug1 = debug('dyndebug1', true);
dyndebug1('OK: should show dyndebug1');

debug.disable();
console.log('DEBUG should be undefined, and it is:', process.env.DEBUG);
dyndebug1('ERROR: should not show dyndebug1');

var dyndebug2 = debug('dyndebug2', true);
dyndebug2('ERROR: should not show dyndebug2');

debug.enable('dyndebug1');
console.log('DEBUG should be dyndebug1, and it is:', process.env.DEBUG);
dyndebug1('OK: should show dyndebug1');

debug.enable('dyndebug2');
console.log('DEBUG should be dyndebug2, and it is:', process.env.DEBUG);
dyndebug1('ERROR: should not show dyndebug1');
dyndebug2('OK: should show dyndebug2');
