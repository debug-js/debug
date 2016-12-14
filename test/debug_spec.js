import { expect } from 'chai';

import debug from '../index';

describe('debug', () => {
  describe('sanity check', () => {
    it('passes', () => {
      const log = debug('test');
      log('hello world');
    });
  });
})
