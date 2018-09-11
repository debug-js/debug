/* global describe, it, context, beforeEach */
'use strict';

let chai;

let expect;

let debug;

let sinon;

let sinonChai;

if (typeof module !== 'undefined') {
	chai = require('chai');
	expect = chai.expect;

	debug = require('../src');
	sinon = require('sinon');
	sinonChai = require('sinon-chai');
	chai.use(sinonChai);
}

describe('debug', () => {
	let log = debug('test');

	log.log = sinon.stub();

	it('passes a basic sanity check', () => {
		expect(log('hello world')).to.not.throw();
	});

	it('allows namespaces to be a non-string value', () => {
		expect(debug.enable(true)).to.not.throw();
	});

	context('with log function', () => {
		beforeEach(() => {
			debug.enable('test');
			log = debug('test');
		});

		it('uses it', () => {
			log.log = sinon.stub();
			log('using custom log function');

			expect(log.log).to.have.been.calledOnce();
		});
	});

	describe('custom functions', () => {
		let log;

		beforeEach(() => {
			debug.enable('test');
			log = debug('test');
		});

		context('with log function', () => {
			it('uses it', () => {
				log.log = sinon.spy();
				log('using custom log function');

				expect(log.log).to.have.been.calledOnce();
			});
		});
	});

	describe('extend namespace', () => {
		let log;

		beforeEach(() => {
			debug.enable('foo');
			log = debug('foo');
		});

		it('should extend namespace', () => {
			const logBar = log.extend('bar');
			expect(logBar.namespace).to.be.equal('foo:bar');
		});

		it('should extend namespace with custom delimiter', () => {
			const logBar = log.extend('bar', '--');
			expect(logBar.namespace).to.be.equal('foo--bar');
		});

		it('should extend namespace with empty delimiter', () => {
			const logBar = log.extend('bar', '');
			expect(logBar.namespace).to.be.equal('foobar');
		});
	});
});
