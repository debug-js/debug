/* eslint-env mocha */

const assert = require('assert');
const debug = require('./src');

describe('debug', () => {
	beforeEach(() => {
		debug.disable();
	});

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

	describe('enable() does not flush existing namespaces (#425)', () => {
		it('merges subsequent enable() calls with previously enabled namespaces', () => {
			debug.enable('foo');
			debug.enable('bar');

			assert.deepStrictEqual(debug.enabled('foo'), true);
			assert.deepStrictEqual(debug.enabled('bar'), true);
		});

		it('preserves namespaces from a prior enable() like DEBUG=foo then enable("bar")', () => {
			debug.enable('foo');
			debug.enable('bar');

			assert.deepStrictEqual(debug.enabled('foo'), true);
			assert.deepStrictEqual(debug.enabled('bar'), true);
			assert.deepStrictEqual(debug.disable(), 'foo,bar');
		});

		it('does not drop earlier namespaces when a later module enables its own', () => {
			debug.enable('my-module');
			debug.enable('my-dep-module');

			assert.deepStrictEqual(debug.enabled('my-module'), true);
			assert.deepStrictEqual(debug.enabled('my-dep-module'), true);
		});

		it('can still replace the set via disable() then enable()', () => {
			debug.enable('foo');
			debug.disable();
			debug.enable('bar');

			assert.deepStrictEqual(debug.enabled('foo'), false);
			assert.deepStrictEqual(debug.enabled('bar'), true);
		});

		it('adds skip patterns without dropping other namespaces', () => {
			debug.enable('foo');
			debug.enable('-foo');
			debug.enable('bar');

			assert.deepStrictEqual(debug.enabled('foo'), false);
			assert.deepStrictEqual(debug.enabled('bar'), true);
		});

		it('re-enabling a skipped namespace removes the skip', () => {
			debug.enable('foo');
			debug.enable('-foo');
			assert.deepStrictEqual(debug.enabled('foo'), false);

			debug.enable('foo');
			assert.deepStrictEqual(debug.enabled('foo'), true);
		});

		it('does not duplicate namespaces when enable() is repeated', () => {
			debug.enable('foo');
			debug.enable('foo');
			debug.enable('bar,foo');

			assert.deepStrictEqual(debug.disable(), 'foo,bar');
		});
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
});
