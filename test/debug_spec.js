/* global describe, it, context, beforeEach */
'use strict';

var chai
  , expect
  , debug
  , sinon
  , sinonChai
  , log;


if (typeof module !== 'undefined') {
  chai = require('chai');
  expect = chai.expect;
  sinon = require('sinon');
  sinonChai = require('sinon-chai');
  chai.use(sinonChai);
}

describe('debug', function () {
  function withDebug(cb) {
    function requireDebug() {
      delete require.cache[require.resolve('../src/index')];
      delete require.cache[require.resolve('../src/node.js')];
      return require('../src/index');
    }

    cb(requireDebug());
  }

  context('start up', function () {
    beforeEach(function () {
      withDebug(function(debugInstance) {
        debug = debugInstance;
        log = debug('test');
        log.log = sinon.stub();
      });
    });

    it('passes a basic sanity check', function () {
      expect(log('hello world')).to.not.throw;
    });

    it('allows namespaces to be a non-string value', function () {
      expect(debug.enable(true)).to.not.throw;
    });
  });


  context('with log function', function () {

    beforeEach(function () {
      withDebug(function(debugInstance) {
        debug = debugInstance;
        debug.enable('test');
        log = debug('test');
      });
    });

    it('uses it', function () {
      log.log = sinon.stub();
      log('using custom log function');

      expect(log.log).to.have.been.calledOnce;
    });
  });

  context('custom functions', function () {

    beforeEach(function () {
      withDebug(function(debugInstance) {
        debug = debugInstance;
        debug.enable('test');
        log = debug('test');
      });
    });

    context('with log function', function () {
      it('uses it', function () {
        log.log = sinon.spy();
        log('using custom log function');

        expect(log.log).to.have.been.calledOnce;
      });
    });
  });

  context('when hiding namespace', function () {
    beforeEach(function () {
      process.env.DEBUG_HIDE_NAMESPACE = true;
      process.env.DEBUG_HIDE_DATE = true;
      withDebug(function(debugInstance) {
        debug = debugInstance;
        debug.enable('test');
        log = debug('test');
      });
    });

    afterEach(function () {
      delete process.env.DEBUG_HIDE_NAMESPACE;
      delete process.env.DEBUG_HIDE_DATE;
    });

    it('produces the log without namespace', function () {
      log.log = sinon.spy();
      log('some message');
      expect(log.log.getCall(0).args[0].trim()).to.equal('some message');
    });
  });
});
