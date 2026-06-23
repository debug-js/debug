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

	describe('enabled before any explicit enable() call', () => {
		it('returns false (not undefined) when DEBUG env var is absent', () => {
			// Regression: when enable() is called with undefined (e.g. DEBUG is
			// not set), createDebug.namespaces is set to undefined.  The per-instance
			// cache initialises namespacesCache to undefined too, so the cache
			// comparison `namespacesCache !== createDebug.namespaces` evaluates to
			// false and enabled() is never invoked, leaving enabledCache as
			// undefined rather than false.
			const savedDebug = process.env.DEBUG;
			delete process.env.DEBUG;
			// Re-create a fresh debug factory with no DEBUG env var
			Object.keys(require.cache).forEach(k => {
				if (k.includes('debug/src')) {
					delete require.cache[k];
				}
			});
			const freshDebug = require('./src');
			const log = freshDebug('test:namespace');
			assert.strictEqual(typeof log.enabled, 'boolean',
				'enabled should be a boolean, not ' + typeof log.enabled);
			assert.strictEqual(log.enabled, false,
				'enabled should be false when no namespaces are active');
			// Restore
			if (savedDebug !== undefined) {
				process.env.DEBUG = savedDebug;
			}
		});
	});
});