/* eslint-env mocha */

const assert = require('assert');
const debug = require('./src');

describe('debug', () => {
	it('passes a basic sanity check', () => {
		const log = debug('test');
		log.enabled = true;
		log.log = () => {};

		assert.doesNotThrow(() => log('hello world'));
	});

	it('allows namespaces to be a non-string value', () => {
		const log = debug('test');
		log.enabled = true;
		log.log = () => {};

		assert.doesNotThrow(() => debug.enable(true));
	});

	it('honors global debug namespace enable calls', () => {
		assert.deepStrictEqual(debug('test:12345').enabled, false);
		assert.deepStrictEqual(debug('test:67890').enabled, false);

		debug.enable('test:12345');
		assert.deepStrictEqual(debug('test:12345').enabled, true);
		assert.deepStrictEqual(debug('test:67890').enabled, false);
	});

	it('uses custom log function', () => {
		const log = debug('test');
		log.enabled = true;

		const messages = [];
		log.log = (...args) => messages.push(args);

		log('using custom log function');
		log('using custom log function again');
		log('%O', 12345);

		assert.deepStrictEqual(messages.length, 3);
	});

	describe('extend namespace', () => {
		it('should extend namespace', () => {
			const log = debug('foo');
			log.enabled = true;
			log.log = () => {};

			const logBar = log.extend('bar');
			assert.deepStrictEqual(logBar.namespace, 'foo:bar');
		});

		it('should extend namespace with custom delimiter', () => {
			const log = debug('foo');
			log.enabled = true;
			log.log = () => {};

			const logBar = log.extend('bar', '--');
			assert.deepStrictEqual(logBar.namespace, 'foo--bar');
		});

		it('should extend namespace with empty delimiter', () => {
			const log = debug('foo');
			log.enabled = true;
			log.log = () => {};

			const logBar = log.extend('bar', '');
			assert.deepStrictEqual(logBar.namespace, 'foobar');
		});

		it('should keep the log function between extensions', () => {
			const log = debug('foo');
			log.log = () => {};

			const logBar = log.extend('bar');
			assert.deepStrictEqual(log.log, logBar.log);
		});
	});

	describe('wildcard namespace matching', () => {
		it('matches simple wildcard at end', () => {
			debug.enable('app:*');
			assert.deepStrictEqual(debug('app:server').enabled, true);
			assert.deepStrictEqual(debug('app:database').enabled, true);
			assert.deepStrictEqual(debug('app:').enabled, true);
			assert.deepStrictEqual(debug('other:server').enabled, false);
		});

		it('matches single wildcard for everything', () => {
			debug.enable('*');
			assert.deepStrictEqual(debug('anything').enabled, true);
			assert.deepStrictEqual(debug('app:server').enabled, true);
			assert.deepStrictEqual(debug('').enabled, true);
		});

		it('matches wildcard in the middle', () => {
			debug.enable('app:*:error');
			assert.deepStrictEqual(debug('app:server:error').enabled, true);
			assert.deepStrictEqual(debug('app:db:error').enabled, true);
			assert.deepStrictEqual(debug('app::error').enabled, true);
			assert.deepStrictEqual(debug('app:server:warn').enabled, false);
		});

		it('matches multiple wildcards', () => {
			debug.enable('*:*:error');
			assert.deepStrictEqual(debug('app:server:error').enabled, true);
			assert.deepStrictEqual(debug('lib:db:error').enabled, true);
			assert.deepStrictEqual(debug('app:server:warn').enabled, false);
		});

		it('handles exact match without wildcards', () => {
			debug.enable('app:server');
			assert.deepStrictEqual(debug('app:server').enabled, true);
			assert.deepStrictEqual(debug('app:server:extra').enabled, false);
			assert.deepStrictEqual(debug('app').enabled, false);
		});

		it('handles exclusion patterns', () => {
			debug.enable('app:*,-app:secret');
			assert.deepStrictEqual(debug('app:server').enabled, true);
			assert.deepStrictEqual(debug('app:database').enabled, true);
			assert.deepStrictEqual(debug('app:secret').enabled, false);
		});

		it('handles exclusion with wildcards', () => {
			debug.enable('*,-app:*');
			assert.deepStrictEqual(debug('lib:util').enabled, true);
			assert.deepStrictEqual(debug('http').enabled, true);
			assert.deepStrictEqual(debug('app:server').enabled, false);
			assert.deepStrictEqual(debug('app:db').enabled, false);
		});

		it('skips take precedence over names', () => {
			debug.enable('app:*,-app:*');
			assert.deepStrictEqual(debug('app:server').enabled, false);
		});

		it('handles multiple comma-separated namespaces', () => {
			debug.enable('app:auth,app:db,lib:cache');
			assert.deepStrictEqual(debug('app:auth').enabled, true);
			assert.deepStrictEqual(debug('app:db').enabled, true);
			assert.deepStrictEqual(debug('lib:cache').enabled, true);
			assert.deepStrictEqual(debug('app:server').enabled, false);
		});

		it('handles spaces as delimiters', () => {
			debug.enable('app:auth app:db');
			assert.deepStrictEqual(debug('app:auth').enabled, true);
			assert.deepStrictEqual(debug('app:db').enabled, true);
		});

		it('handles leading/trailing whitespace', () => {
			debug.enable('  app:server  ');
			assert.deepStrictEqual(debug('app:server').enabled, true);
		});
	});

	describe('enabled', () => {
		it('returns false when nothing is enabled', () => {
			debug.enable('');
			assert.deepStrictEqual(debug.enabled('anything'), false);
		});

		it('returns true for exact namespace match', () => {
			debug.enable('foo');
			assert.deepStrictEqual(debug.enabled('foo'), true);
			assert.deepStrictEqual(debug.enabled('bar'), false);
		});

		it('returns true for wildcard match', () => {
			debug.enable('foo:*');
			assert.deepStrictEqual(debug.enabled('foo:bar'), true);
			assert.deepStrictEqual(debug.enabled('foo:'), true);
			assert.deepStrictEqual(debug.enabled('bar:baz'), false);
		});

		it('returns false for skipped namespace', () => {
			debug.enable('*,-foo');
			assert.deepStrictEqual(debug.enabled('bar'), true);
			assert.deepStrictEqual(debug.enabled('foo'), false);
		});
	});

	describe('coerce', () => {
		it('converts Error to stack trace', () => {
			const log = debug('test');
			log.enabled = true;

			const messages = [];
			log.log = (...args) => messages.push(args);

			const err = new Error('test error');
			log(err);

			assert.deepStrictEqual(messages.length, 1);
			assert(messages[0][0].includes('test error'));
		});

		it('converts Error without stack to message', () => {
			const log = debug('test');
			log.enabled = true;

			const messages = [];
			log.log = (...args) => messages.push(args);

			const err = new Error('no stack');
			err.stack = '';
			log(err);

			assert.deepStrictEqual(messages.length, 1);
			assert(messages[0][0].includes('no stack'));
		});

		it('passes non-Error values through unchanged', () => {
			const log = debug('test');
			log.enabled = true;

			const messages = [];
			log.log = (...args) => messages.push(args);

			log('plain string');
			assert.deepStrictEqual(messages.length, 1);
		});
	});

	describe('selectColor', () => {
		it('returns consistent color for same namespace', () => {
			const color1 = debug.selectColor('test');
			const color2 = debug.selectColor('test');
			assert.deepStrictEqual(color1, color2);
		});

		it('returns a color from the available colors array', () => {
			const color = debug.selectColor('myapp');
			assert(debug.colors.includes(color));
		});
	});

	describe('formatters', () => {
		it('handles %% escape sequence', () => {
			const log = debug('test');
			log.enabled = true;

			const messages = [];
			log.log = (...args) => messages.push(args);

			log('100%% complete');
			assert.deepStrictEqual(messages.length, 1);
			assert(messages[0][0].includes('100% complete'));
		});

		it('prepends %O for non-string first argument', () => {
			const log = debug('test');
			log.enabled = true;

			const messages = [];
			log.log = (...args) => messages.push(args);

			log({key: 'value'});
			assert.deepStrictEqual(messages.length, 1);
		});

		it('supports custom formatters', () => {
			debug.formatters.z = v => v.toUpperCase();

			const log = debug('test');
			log.enabled = true;

			const messages = [];
			log.log = (...args) => messages.push(args);

			log('%z', 'hello');
			assert.deepStrictEqual(messages.length, 1);
			assert(messages[0][0].includes('HELLO'));

			delete debug.formatters.z;
		});
	});

	describe('rebuild namespaces string (disable)', () => {
		it('handle names, skips, and wildcards', () => {
			debug.enable('test,abc*,-abc');
			const namespaces = debug.disable();
			assert.deepStrictEqual(namespaces, 'test,abc*,-abc');
		});

		it('handles empty', () => {
			debug.enable('');
			const namespaces = debug.disable();
			assert.deepStrictEqual(namespaces, '');
			assert.deepStrictEqual(debug.names, []);
			assert.deepStrictEqual(debug.skips, []);
		});

		it('handles all', () => {
			debug.enable('*');
			const namespaces = debug.disable();
			assert.deepStrictEqual(namespaces, '*');
		});

		it('handles skip all', () => {
			debug.enable('-*');
			const namespaces = debug.disable();
			assert.deepStrictEqual(namespaces, '-*');
		});

		it('names+skips same with new string', () => {
			debug.enable('test,abc*,-abc');
			const oldNames = [...debug.names];
			const oldSkips = [...debug.skips];
			const namespaces = debug.disable();
			assert.deepStrictEqual(namespaces, 'test,abc*,-abc');
			debug.enable(namespaces);
			assert.deepStrictEqual(oldNames.map(String), debug.names.map(String));
			assert.deepStrictEqual(oldSkips.map(String), debug.skips.map(String));
		});

		it('handles re-enabling existing instances', () => {
			debug.disable('*');
			const inst = debug('foo');
			const messages = [];
			inst.log = msg => messages.push(msg.replace(/^[^@]*@([^@]+)@.*$/, '$1'));

			inst('@test@');
			assert.deepStrictEqual(messages, []);
			debug.enable('foo');
			assert.deepStrictEqual(messages, []);
			inst('@test2@');
			assert.deepStrictEqual(messages, ['test2']);
			inst('@test3@');
			assert.deepStrictEqual(messages, ['test2', 'test3']);
			debug.disable('*');
			inst('@test4@');
			assert.deepStrictEqual(messages, ['test2', 'test3']);
		});
	});
});
