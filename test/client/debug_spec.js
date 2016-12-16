/* globals describe, it, expect, debug*/ 
describe('debug', function () {
  describe('sanity check', function () {
    it('passes', function () {
      const log = debug('test');
      expect(log('hello world')).to.not.throw;
    });
  });
});