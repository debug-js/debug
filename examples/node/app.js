const http = require('http');
const debug = require('../../src')('http'); // ../../src can be replaced with debug if run outside of this repository
const {worka, workb} = require('./worker');

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
worka();
workb();
