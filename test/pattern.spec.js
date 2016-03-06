"use strict";
const cache = require('../cache');
const koa = require('koa');
const request = require('supertest');
const util = require('./util');

describe('patterns', () => {

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

  it('should match all if no patterns present', () => {
    app.use(cache({}));
    app.use(middleware);

    const agent = request(app.callback());

    const testPaths = ['/', '/users', '/users/1'];
    const requests = util.assertAllCached(agent, spy, testPaths);

    return Promise.all(requests).then(() => {
      expect(spy).to.have.callCount(3);
    });
  });

  it('should match a given pattern string', () => {
    app.use(cache({
      pattern: '/api/**/*'
    }));
    app.use(middleware);

    const agent = request(app.callback());

    const matchingPaths = ['/api/users', '/api/users/1'];
    const nonMatchingPaths = ['/', '/users', '/users/1', '/api'];

    let requests = util.assertAllCached(agent, spy, matchingPaths);
    requests = requests.concat(util.assertAllNotCached(agent, spy, nonMatchingPaths));

    return Promise.all(requests).then(() => {

      // once on each matching call, twice on each non matching call
      expect(spy).to.have.callCount(10);
    });
  });

  it('should match all patterns in a given pattern array', () => {

    app.use(cache({
      pattern: [
        '/api',
        '/api/v1/**/*',
        '/api/v2/**/*'
      ]
    }));
    app.use(middleware);

    const agent = request(app.callback());

    const matchingPaths = ['/api', '/api/v1/users', '/api/v2/users/1'];
    const nonMatchingPaths = ['/', '/users', '/api/users', '/api/v0/users/1'];

    let requests = util.assertAllCached(agent, spy, matchingPaths);
    requests = requests.concat(util.assertAllNotCached(agent, spy, nonMatchingPaths));

    return Promise.all(requests).then(() => {

      // once on each matching call, twice on each non matching call
      expect(spy).to.have.callCount(11);
    });
  });

  it('should throw an error if not an expected type', () => {
    expect(cache.bind(this, {
      pattern: {woah: 'object'}
    })).to.throw(Error);

    expect(cache.bind(this, {
      pattern: ['/path', {woah: 'object'}]
    })).to.throw(Error);
  });
});