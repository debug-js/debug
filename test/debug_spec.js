/* global describe, it, context, beforeEach */
'use strict';

var chai
  , expect
  , debug
  , sinon
  , sinonChai;

if (typeof module !== 'undefined') {
  chai = require('chai');
  expect = chai.expect;

  debug = require('../src/index');
  sinon = require('sinon');
  sinonChai = require("sinon-chai");
  chai.use(sinonChai);
}


describe('debug', function () {
  var log = debug('test');

  log.log = sinon.stub();

  it('passes a basic sanity check', function () {
    expect(log('hello world')).to.not.throw;
  });

  it('allows namespaces to be a non-string value', function () {
    expect(debug.enable(true)).to.not.throw;
  });

  context('with log function', function () {

    beforeEach(function () {
      debug.enable('test');
      log = debug('test');
    });

    it('uses it', function () {
      log.log = sinon.stub();
      log('using custom log function');

      expect(log.log).to.have.been.calledOnce;
    });
  });

  describe('custom functions', function () {
    var log;

    beforeEach(function () {
      debug.enable('test');
      log = debug('test');
    });

    context('with log function', function () {
      it('uses it', function () {
        log.log = sinon.spy();
        log('using custom log function');

        expect(log.log).to.have.been.calledOnce;
      });
    });
  });

   context('disable()', function () {
     beforeEach(function () {
       debug.enable('*');
       debug('should disable')
     });

     it('disable itself', function () {
       debug.disable('*');
       expect(debug.enabled('*')).to.be.false;
     });
   });

   it('should avoid namespace conflict', function () {
     debug.enable('test1*');
     debug.enable('test2*');

     expect(debug('test1').enabled).to.be.true;
     expect(debug('test2').enabled).to.be.true;
   });
});
