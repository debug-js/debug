var able = require('../able');
var assert = require('assert');

describe('enable/disable feature', function () {
  afterEach(able.clear);

  describe('.enabled(ns)', function () {
    it('should return booleans', function () {
      assert.strictEqual(able.enabled('foo'), false);
      able.enable('*');
      assert.strictEqual(able.enabled('foo'), true);
    });

    it('should not allow anything by default', function () {
      assert(!able.enabled('express'));
      assert(!able.enabled('connect'));
    });

    it('should work with basic strings', function () {
      able.enable('express');
      assert(able.enabled('express'));
      assert(!able.enabled('connect'));
    });

    it('should work with wildcards', function () {
      able.enable('express*');
      assert(able.enabled('express'));
      assert(able.enabled('express:router'));
      assert(!able.enabled('connect'));
    });
  });

  describe('.stringify()', function () {
    it('should return a string', function () {
      assert.equal(typeof able.stringify(), 'string');
    });

    it('should return a comma-separated list of enabled namespaces', function () {
      able.enable('a');
      able.enable('b');
      able.enable('c');
      assert.equal(able.stringify(), 'a,b,c');
    });

    it('should prefix disabled namespaces with a hyphen', function () {
      able.enable('*');
      able.disable('express');
      able.disable('connect');
      assert.equal(able.stringify(), '*,-express,-connect');
    });
  });

  describe('.parse(str)', function () {
    it('should respect either white-space or comma separated values', function () {
      able.parse('a,b c  , d    e');
      assert(able.enabled('a'));
      assert(able.enabled('b'));
      assert(able.enabled('c'));
      assert(able.enabled('d'));
      assert(able.enabled('e'));
    });

    it('should treat hyphen prefixs as disabled', function () {
      able.enable('*');
      able.parse('-b,-c,  -d  -e');
      assert(able.enabled('a'));
      assert(!able.enabled('b'));
      assert(!able.enabled('c'));
      assert(!able.enabled('d'));
      assert(!able.enabled('e'));
      assert(able.enabled('f'));
    });
  });

  describe('.enable(ns)', function () {
    it('should enable the specified namespace', function () {
      able.enable('express');
      assert(able.enabled('express'));
    });

    it('should enable the specified wildcard namespace', function () {
      able.enable('express*');
      assert(able.enabled('express:router'));
    });

    it('should work correctly even when previously disabled', function () {
      able.enable('*');
      assert(able.enabled('express'));
      able.disable('express');
      assert(!able.enabled('express'));
      able.enable('express');
      assert(able.enabled('express'));
    });
  });

  describe('.disable(ns)', function () {
    it('should disable the specified namespace', function () {
      able.enable('*');
      able.disable('express');
      assert(!able.enabled('express'));
    });

    it('should disable the specified wildcard namespace', function () {
      able.enable('*');
      able.disable('express*');
      assert(!able.enabled('express:router'));
    });

    it('should work correctly even when previously enabled', function () {
      able.enable('express');
      assert(able.enabled('express'));
      able.disable('express');
      assert(!able.enabled('express'));
    });
  });
});
