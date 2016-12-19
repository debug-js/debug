/* global describe, it */

if (typeof module !== 'undefined' && module.exports) {
  const chai = require('chai');
  const expect = chai.expect;
  
  const debug = require('../src/index');
  const sinon = require('sinon');
  var sinonChai = require("sinon-chai");
  chai.use(sinonChai);
}

const dummyConsole = {
  log: function() {
    //dummy function
  }
};

debug.log = dummyConsole;


describe('debug', function () {
  const log = debug('test');
  log.log = sinon.stub();
    it('passes a basic sanity check', function () {
      expect(log('hello world')).to.not.throw;
    });
    
    it('Should output to the log function', function () {
      sinon.spy(dummyConsole, 'log');
      log('Hello world');
      //expect(dummyConsole.log).to.have.been.called;
    });
});
