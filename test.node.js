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

		it('calls util.formatWithOptions with inspectOpts (STDOUT)', () => {
			debug.enable('*');
			const options = {
				hideDate: true,
				colors: true,
				depth: 10,
				showHidden: true,
				useStdout: true
			};
			Object.assign(debug.inspectOpts, options);
			const stdOutWriteStub = sinon.stub(process.stdout, 'write');
			const log = debug('format with inspectOpts');
			log('hello world2');
			assert.deepStrictEqual(util.formatWithOptions.getCall(0).args[0], options);
			stdOutWriteStub.restore();
		});
	});
});
