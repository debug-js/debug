/* eslint-env mocha */

const assert = require('assert');
const debug = require('./src');
const isBrowser = !!window;

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

	it('exposes public members per instance', () => {
		const log = debug('foo');
		assert.deepStrictEqual(Object.keys(log), [
			'namespace',
			'useColors',
			'timeFormat',
			'color',
			'extend',
			'destroy',
			'enabled'
		].concat(isBrowser ? [] : ['inspectOpts']))
	});

	describe('timeFormat', () => {
		const regex = isBrowser ? {
			def: /%cfoo %chello%c \+0ms/,
			iso: /%cfoo %c\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z hello%c \+0ms/,
			localized: /%cfoo %c\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3} \+\d{2}:\d{2}  hello%c /,
			diff: /%cfoo %chello%c \+0ms,color: #99CC00,color: inherit,color: #99CC00/,
			none: /%cfoo %chello%c /
		} : {
			def: /\x1B\[36;1mfoo \x1B\[0mhello\x1B\[36m \+0ms\x1B\[0m/,
			iso: /\x1B\[36;1mfoo \x1B\[0m\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z hello/,
			localized: /\x1B\[36;1mfoo \x1B\[0m\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3} \+\d{2}:\d{2}  hello/,
			diff: /\x1B\[36;1mfoo \x1B\[0mhello\x1B\[36m \+0ms\x1B\[0m/,
			none: /\x1B\[36;1mfoo \x1B\[0mhello/
		}
		
		it('defaults to \'iso\' when non-TTY in Node, \'diff\' in browser', () => {
			const log = debug('foo');
			log.enabled = true;
			let result = '';

			log.log = str => result += str;
			log('hello');
			const match = regex.def.test(result);
			console.log(result)
			assert.strictEqual(match, true);
		});

		it('accepts value of \'localized\'', () => {
			const log = debug('foo');
			log.enabled = true;
			log.timeFormat = 'localized';
			let result = '';

			log.log = str => result += str;
			log('hello');
			console.log(result)
			const match = regex.localized.test(result);
			assert.strictEqual(match, true);
		});

		it('accepts value of \'diff\'', () => {
			const log = debug('foo');
			log.enabled = true;
			log.timeFormat = 'diff';
			let result;

			log.log = (...args) => {
		    result = args.join(',');
			}
			log('hello');
			const match = regex.diff.test(result);
			assert.strictEqual(match, true);
		});

		it('accepts value of \'none\'', () => {
			const log = debug('foo');
			log.enabled = true;
			log.timeFormat = 'none';
			let result = '';

			log.log = str => result += str;
			log('hello');
			console.log(result)
			const match = regex.none.test(result);
			assert.strictEqual(match, true);
		});
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
