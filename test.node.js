/* eslint-env mocha */

const assert = require('assert');
const util = require('util');
const fs = require('fs');
const Module = require('module');
const vm = require('vm');
const sinon = require('sinon');
const debug = require('./src/node');

const formatWithOptionsSpy = sinon.spy(util, 'formatWithOptions');

function loadBrowser(globals) {
	const filename = require.resolve('./src/browser');
	const browserModule = new Module(filename, module);
	browserModule.filename = filename;
	browserModule.paths = module.paths;
	const context = {
		module: browserModule,
		exports: browserModule.exports,
		require: browserModule.require.bind(browserModule),
		console
	};
	Object.keys(globals || {}).forEach(key => {
		Object.defineProperty(context, key, Object.getOwnPropertyDescriptor(globals, key));
	});
	vm.runInNewContext(fs.readFileSync(filename, 'utf8'), context, {filename});
	return browserModule.exports;
}
beforeEach(() => {
	formatWithOptionsSpy.resetHistory();
});

describe('debug node', () => {
	describe('formatting options', () => {
		it('calls util.formatWithOptions', () => {
			debug.enable('*');
			const stdErrWriteStub = sinon.stub(process.stderr, 'write');
			const log = debug('formatting options');
			log('hello world');
			assert(util.formatWithOptions.callCount === 1);
			stdErrWriteStub.restore();
		});

		it('calls util.formatWithOptions with inspectOpts', () => {
			debug.enable('*');
			const options = {
				hideDate: true,
				colors: true,
				depth: 10,
				showHidden: true
			};
			Object.assign(debug.inspectOpts, options);
			const stdErrWriteStub = sinon.stub(process.stderr, 'write');
			const log = debug('format with inspectOpts');
			log('hello world2');
			assert.deepStrictEqual(util.formatWithOptions.getCall(0).args[0], options);
			stdErrWriteStub.restore();
		});
	});
});

describe('browser storage', () => {
	it('avoids caught exceptions when localStorage is unavailable', function (done) {
		let inspector;
		try {
			inspector = require('inspector');
		} catch (error) {
			// The inspector module is not available on Node.js 6.
			if (error.code !== 'MODULE_NOT_FOUND') {
				throw error;
			}

			this.skip();
			return;
		}

		const session = new inspector.Session();
		const exceptions = [];
		let recording = false;
		let inspectorError;
		const finish = failure => {
			recording = false;
			session.post('Debugger.setPauseOnExceptions', {state: 'none'}, resetError => {
				session.disconnect();
				done(failure || resetError || inspectorError);
			});
		};
		session.connect();
		session.on('Debugger.paused', message => {
			if (recording && message.params.reason === 'exception') {
				exceptions.push(message.params.data.className);
			}
			session.post('Debugger.resume', error => {
				inspectorError = inspectorError || error;
			});
		});
		session.post('Debugger.enable', enableError => {
			if (enableError) {
				session.disconnect();
				done(enableError);
				return;
			}

			session.post('Debugger.setPauseOnExceptions', {state: 'all'}, pauseError => {
				if (pauseError) {
					session.disconnect();
					done(pauseError);
					return;
				}

				let failure;
				try {
					recording = true;
					// Prove that caught exceptions are observed before testing their absence.
					try {
						throw new Error('Inspector control');
					} catch (error) {
						assert.strictEqual(error.message, 'Inspector control');
					}

					assert.deepStrictEqual(exceptions, ['Error']);
					exceptions.length = 0;
					const browser = loadBrowser();
					browser.enable('storage-test');
					assert.strictEqual(browser('storage-test').enabled, true);
					browser.disable();
					recording = false;
					assert.deepStrictEqual(exceptions, []);
					assert.ifError(inspectorError);
				} catch (error) {
					failure = error;
				} finally {
					finish(failure);
				}
			});
		});
	});

	it('keeps loading, saving and clearing available storage', () => {
		const values = new Map([['DEBUG', 'stored']]);
		const storage = {
			getItem: key => values.get(key),
			setItem: (key, value) => values.set(key, value),
			removeItem: key => values.delete(key)
		};
		const browser = loadBrowser({localStorage: storage});
		assert.strictEqual(browser('stored').enabled, true);
		browser.enable('changed');
		assert.strictEqual(values.get('debug'), 'changed');
		browser.disable();
		assert.strictEqual(values.has('debug'), false);
	});

	it('keeps handling a denied localStorage getter', () => {
		let reads = 0;
		const globals = Object.defineProperty({}, 'localStorage', {
			enumerable: true,
			get() {
				reads++;
				throw new Error('Storage access denied');
			}
		});
		const browser = loadBrowser(globals);
		assert(reads > 0);
		browser.enable('changed');
		assert.strictEqual(browser('changed').enabled, true);
		browser.disable();
		assert.strictEqual(browser('changed').enabled, false);
	});

	it('keeps handling storage access failures and the environment fallback', () => {
		const fail = () => {
			throw new Error('Storage access denied');
		};
		const browser = loadBrowser({
			localStorage: {getItem: fail, setItem: fail, removeItem: fail},
			process: {env: {DEBUG: 'fallback'}}
		});
		assert.strictEqual(browser('fallback').enabled, true);
		browser.enable('changed');
		assert.strictEqual(browser('changed').enabled, true);
		browser.disable();
		assert.strictEqual(browser('changed').enabled, false);
	});
});
