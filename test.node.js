/* eslint-env mocha */

const assert = require('assert');
const {spawnSync} = require('child_process');
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

		it('honors DEBUG_HIDE_DATE when set as a flag', () => {
			const script = `
				const tty = require('tty');
				tty.isatty = () => false;
				const debug = require('./src/node');
				debug.enable('test');
				const log = debug('test');
				const args = ['hello'];
				debug.formatArgs.call(log, args);
				process.stdout.write(args[0]);
			`;

			for (const hideDate of ['', '1', 'true']) {
				const result = spawnSync(process.execPath, ['-e', script], {
					cwd: __dirname,
					env: {
						...process.env,
						DEBUG: 'test',
						DEBUG_HIDE_DATE: hideDate
					},
					encoding: 'utf8'
				});

				assert.strictEqual(result.status, 0, result.stderr);
				assert.strictEqual(result.stdout, 'test hello');
			}
		});
	});
});
