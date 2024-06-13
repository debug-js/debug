import createDebug from '../src/node.js';

// not working -> set env in node.sh
// process.env['DEBUG'] = 'main'

const debug = createDebug('main');

debug('hello');
