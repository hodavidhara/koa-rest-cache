"use strict";
const cache = require('../cache');
const koa = require('koa');
const request = require('supertest');
const util = require('./util');

describe('edge cases', () => {
  describe('no arguments', () => {
    let spy;
    let agent;

    beforeEach(() => {
      const app = koa();
      spy = sinon.spy(function() {
        this.body = {path: this.request.path};
      });
      app.use(cache());
      app.use(function*() {
        spy.bind(this)(this.request.path);
      });

      agent = request(app.callback());
    });

    it('should match all requests', () => {
      const testPaths = ['/', '/users', '/users/1'];
      const requests = util.assertAllCached(agent, spy, testPaths);

      return Promise.all(requests).then(() => {
        expect(spy).to.have.callCount(3);
      });
    })
  })
});