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

  describe('timed sections', function () {
    var log;

    beforeEach(function () {
      debug.enable('test');
      log = debug('test');
    });

    context('with log function', function () {
      it('times a critical section', function () {
        log.log = sinon.spy();

        var section = log.begin('a critical section');
        log('something inside the section');
        section.end();

        expect(log.log).to.have.been.calledThrice;
      });

      it('times a critical function', function () {
        log.log = sinon.spy();

        var result = log.time('a critical function', function () {
          log('hello from inside');
          return 1234;
        });

        expect(result).to.equal(1234);
        expect(log.log).to.have.been.calledThrice;
      });

      if (typeof Promise !== 'undefined') {
        it('times a critical asynchronous function', function (cb) {
          log.log = sinon.spy();

          log.time('a critical function', function () {
            return new Promise(function (resolve) {
              log('hello from the inside');
              resolve(1234);
            });
          }).then(function (result) {
            expect(result).to.equal(1234);
            expect(log.log).to.have.been.calledThrice;
            cb();
          }).catch(cb);
        });
      }

      it('should throw if there aren\'t enough arguments', function () {
        log.log = sinon.stub();

        expect(function () {
          log.time();
        }).to.throw('debug.time() takes at least a debug string and a function');

        expect(function () {
          log.time('hello');
        }).to.throw('debug.time() takes at least a debug string and a function');

        expect(function () {
          log.time(function () {});
        }).to.throw('debug.time() takes at least a debug string and a function');
      });

      it('should throw if last argument isn\'t a function', function () {
        log.log = sinon.stub();

        expect(function () {
          log.time('hello', 1234);
        }).to.throw('the last argument to debug.time() must be a function');

        expect(function () {
          log.time('hello', function () {}, 1235);
        }).to.throw('the last argument to debug.time() must be a function');
      });
    });
  });
});
