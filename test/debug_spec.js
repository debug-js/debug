import { expect } from 'chai';
import { assert, spy } from 'sinon';

import debug from '../index';

describe('debug', () => {
  describe('sanity check', () => {
    it('passes', () => {
      const log = debug('test');
      log('hello world');
    });
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
});
