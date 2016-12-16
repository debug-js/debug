const expect = require('chai').expect

const debug = require('../../src/index');

describe('debug', function () {
  describe('sanity check', function () {
    it('passes', function () {
      const log = debug('test');
      log('hello world');
    });
  });
})
