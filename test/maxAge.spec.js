"use strict";
const cache = require('../cache');
const koa = require('koa');
const request = require('supertest');
const util = require('./util');

describe('maxAge', () => {
  let app;
  let spy;
  let middleware;

  beforeEach(() => {
    app = koa();
    spy = sinon.spy(function() {
      this.body = {path: this.request.path};
    });
    middleware = function*() {
      spy.bind(this)(this.request.path);
    }
  });

  it('clears a key once it has been in the cache longer than the maxAge', (done) => {
    const maxAge = 50;
    const testPath = '/';
    app.use(cache({
      maxAge
    }));
    app.use(middleware);
    const agent = request(app.callback());

    spy.withArgs(testPath);

    util.requestTwice(agent, testPath, function() {

      // First Request
      expect(spy.withArgs(testPath)).to.have.been.calledOnce;
      
      setTimeout(function() {
        agent.get(testPath)
          .end(function() {

            // Third Request (uncached) second uncached request.
            expect(spy.withArgs(testPath)).to.have.been.calledTwice;
            done();
          });
      }, maxAge)
    }, function() {

      // Second Request (cached);
      expect(spy.withArgs(testPath)).to.have.been.calledOnce;
    });
  });

  it('should throw an error if not an expected type', () => {
    expect(cache.bind(this, {
      maxAge: {woah: 'object'}
    })).to.throw(Error);
  });
});