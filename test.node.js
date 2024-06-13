/* eslint-env mocha */

import assert from 'node:assert';
import util from 'node:util';
import * as process from "node:process";
import sinon from 'sinon';
import debug from './src/node.js';

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
				showHidden: true,
			};
			Object.assign(debug.inspectOpts, options);
			const stdErrorWriteStub = sinon.stub(process.stderr, 'write');
			const log = debug('format with inspectOpts');
			log('hello world2');
			assert.deepStrictEqual(util.formatWithOptions.getCall(0).args[0], options);
			stdErrorWriteStub.restore();
		});
	});
});
