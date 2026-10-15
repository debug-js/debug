/* eslint-env mocha */

const assert = require('assert');
const util = require('util');
const sinon = require('sinon');
const debug = require('./src/node');

const formatWithOptionsSpy = sinon.spy(util, 'formatWithOptions');
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

	describe('escaped percent (%%) before a specifier', () => {
		// Returns the body of the logged line (namespace prefix stripped) so it can
		// be compared against `util.format`, which the README documents as the
		// source of truth for `%s`/`%d`/`%j`.
		function render(template, ...rest) {
			debug.enable('*');
			debug.inspectOpts.hideDate = true;
			debug.inspectOpts.colors = false;

			const stdErrWriteStub = sinon.stub(process.stderr, 'write');
			try {
				debug('render')(template, ...rest);
			} finally {
				stdErrWriteStub.restore();
			}

			const line = stdErrWriteStub.getCall(0).args[0].replace(/\n$/, '');
			const marker = 'render ';
			return line.slice(line.indexOf(marker) + marker.length);
		}

		it('keeps parity with util.format for %% followed by a specifier', () => {
			assert.strictEqual(render('%%%s', 'X'), util.format('%%%s', 'X'));
			assert.strictEqual(render('100%%%d done', 50), util.format('100%%%d done', 50));
		});

		it('still collapses %% when no arguments remain', () => {
			assert.strictEqual(render('100%% done'), '100% done');
			assert.strictEqual(render('a %% b %% c'), 'a % b % c');
		});

		it('keeps custom formatters working alongside %%', () => {
			assert.strictEqual(render('%o %% done', {a: 1}), '{ a: 1 } % done');
			assert.strictEqual(render('%o %%%s', {a: 1}, 'X'), '{ a: 1 } %X');
		});

		it('does not collapse %% inside custom formatter output', () => {
			assert.strictEqual(render('%o', {k: '50%% off'}), '{ k: \'50%% off\' }');
		});
	});
});
