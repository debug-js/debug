const Debug = require('../');

let disabled = null;
let debug = null;

describe('debug', () => {
  beforeEach((done) => {
    debug = new Debug('debug-test');
    disabled = new Debug('debug-disabled');
    done();
  });

  it('should not print a debug line', (done) => {
    
    disabled('test debug');
    done();
  });

  it('should print a debug line', (done) => {
    debug('test debug');
    done();
  });

  it('should print nothing', (done) => {
    debug();
    done();
  });

  it('should have a bunch of options set', (done) => {
    process.env.DEBUG_COLORS = 'no';
    process.env.DEBUG_DEPTH = 10;
    process.env.DEBUG_SHOW_HIDDEN = 'enabled';
    debug('options test');
    done();
  });

  it('should disable debug', (done) => {
    Debug.disable();
    const disabledDebug = new Debug('debug-test');
    disabledDebug('disabled test');
    done();
  });

  it('should check for enabled', (done) => {
    if (Debug.enabled('debug-test')) {
      return done();
    }
    done('not enabled');
  });
});
