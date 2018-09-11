const http = require('http');

const debug = require('../..')('http');

const name = 'My App';

// Fake app

debug('booting %o', name);

http.createServer((req, res) => {
	debug(req.method + ' ' + req.url);
	res.end('hello\n');
}).listen(3000, () => {
	debug('listening');
});

// Fake worker of some kind
// eslint-disable-next-line import/no-unassigned-import
require('./worker');
