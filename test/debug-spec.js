/* eslint-env mocha */
'use strict';

let chai;

let expect;

let debug;

if (typeof module !== 'undefined') {
	chai = require('chai');
	expect = chai.expect;
	debug = require('../src');
}

describe('debug', () => {
	it('passes a basic sanity check', () => {
		const log = debug('test');
		log.enabled = true;
		log.log = () => {};

		expect(() => log('hello world')).to.not.throw();
	});

	it('allows namespaces to be a non-string value', () => {
		const log = debug('test');
		log.enabled = true;
		log.log = () => {};

		expect(() => debug.enable(true)).to.not.throw();
	});

	it('honors global debug namespace enable calls', () => {
		expect(debug('test:12345').enabled).to.equal(false);
		expect(debug('test:67890').enabled).to.equal(false);

		debug.enable('test:12345');
		expect(debug('test:12345').enabled).to.equal(true);
		expect(debug('test:67890').enabled).to.equal(false);
	});

	it('uses custom log function', () => {
		const log = debug('test');
		log.enabled = true;

		const messages = [];
		log.log = (...args) => messages.push(args);

		log('using custom log function');
		log('using custom log function again');
		log('%O', 12345);

		expect(messages.length).to.equal(3);
	});

	describe('extend namespace', () => {
		it('should extend namespace', () => {
			const log = debug('foo');
			log.enabled = true;
			log.log = () => {};

			const logBar = log.extend('bar');
			expect(logBar.namespace).to.be.equal('foo:bar');
		});

		it('should extend namespace with custom delimiter', () => {
			const log = debug('foo');
			log.enabled = true;
			log.log = () => {};

			const logBar = log.extend('bar', '--');
			expect(logBar.namespace).to.be.equal('foo--bar');
		});

		it('should extend namespace with empty delimiter', () => {
			const log = debug('foo');
			log.enabled = true;
			log.log = () => {};

			const logBar = log.extend('bar', '');
			expect(logBar.namespace).to.be.equal('foobar');
		});
	});
});
