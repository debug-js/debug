const debug = require('../..');

debug.enable('*');

for (let i = 0; i < debug.colors.length; i++) {
	const d = debug('example:' + i);
	d('The color is %o', d.color);
}
