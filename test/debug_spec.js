/* global describe, it */
'use strict'

if (typeof module !== 'undefined') {
  var chai = require('chai');
  var expect = chai.expect;
  
  var debug = require('../src/index');
  var sinon = require('sinon');
  var sinonChai = require("sinon-chai");
  chai.use(sinonChai);
}

var dummyConsole = {
  log: function() {
    //dummy function
  }
};


describe('debug', function () {
  var log = debug('test');
  
  log.log = sinon.stub();
    it('passes a basic sanity check', function () {
      expect(log('hello world')).to.not.throw;
    });
    
    it('Should output to the log function', function () {
      debug.log = dummyConsole.log;
      sinon.spy(dummyConsole, 'log');
      log('Hello world');
      //expect(dummyConsole.log).to.have.been.called;
    });
<<<<<<< HEAD
=======
  });
  
  describe('custom functions', () => {
    let log;

    beforeEach(() => {
      debug.enable('test');
      log = debug('test');
    });

    context('with log function', () => {
      it('uses it', () => {
        log.log = spy();
        log('using custom log function');

        assert.calledOnce(log.log);
      });
    });
  });
>>>>>>> upstream/master
});
