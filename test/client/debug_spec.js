describe('debug', function () {
  describe('sanity check', function () {
    it('passes', function () {
      const log = debug('test');
      log('hello world');
    });
  });
});