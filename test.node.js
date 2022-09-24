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
	it('should log errors with properties', () => {
		const log = debug('formatting options');
		log.useColors = false;
		log.enabled = true;
		log.log = sinon.fake();
		const error = Error('hello');
		error.customProp = 'foo';
		log(error);
		assert.ok(log.log.calledWith(sinon.match(/customProp: 'foo'/)));
	});

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
			assert.deepStrictEqual(
				util.formatWithOptions.getCall(0).args[0],
				options
			);
			stdErrWriteStub.restore();
		});
	});
});
