"use strict";
const cache = require('../cache');
const koa = require('koa');
const request = require('supertest');
const util = require('./util');

describe('methods', () => {

  let app;
  let spy;
  let middleware;

  beforeEach(() => {
    app = koa();
    spy = sinon.spy(function() {
      this.body = {path: this.request.path};
    });
    middleware = function*() {
      spy.bind(this)(this.request.path, this.method);
    }
  });

  it('should match GET by default', () => {
    app.use(cache({}));
    app.use(middleware);

    const agent = request(app.callback());
    const testPath = '/';

    const requests = [];
    requests.push(new Promise((resolve) => {
      agent.get(testPath)
        .end(function(err, res) {
          expect(spy.withArgs(testPath, 'GET')).to.have.been.calledOnce;
          agent.get(testPath)
            .end(function(err, res) {
              expect(spy.withArgs(testPath, 'GET')).to.have.been.calledOnce;
              resolve();
            })
        });
    }));

    requests.push(new Promise((resolve) => {
      agent.head(testPath)
        .end(function(err, res) {
          expect(spy.withArgs(testPath, 'HEAD')).to.have.been.calledOnce;
          agent.head(testPath)
            .end(function(err, res) {
              expect(spy.withArgs(testPath, 'HEAD')).to.have.been.calledTwice;
              resolve();
            })
        });
    }));

    return Promise.all(requests).then(() => {
      expect(spy).to.have.callCount(3);
    });
  });

  it('should match a given string', () => {
    app.use(cache({
      method: 'HEAD'
    }));
    app.use(middleware);

    const agent = request(app.callback());
    const testPath = '/';

    const requests = [];
    requests.push(new Promise((resolve) => {
      agent.get(testPath)
        .end(function(err, res) {
          expect(spy.withArgs(testPath, 'GET')).to.have.been.calledOnce;
          agent.get(testPath)
            .end(function(err, res) {
              expect(spy.withArgs(testPath, 'GET')).to.have.been.calledTwice;
              resolve();
            })
        });
    }));

    requests.push(new Promise((resolve) => {
      agent.head(testPath)
        .end(function(err, res) {
          expect(spy.withArgs(testPath, 'HEAD')).to.have.been.calledOnce;
          agent.head(testPath)
            .end(function(err, res) {
              expect(spy.withArgs(testPath, 'HEAD')).to.have.been.calledOnce;
              resolve();
            })
        });
    }));

    return Promise.all(requests).then(() => {
      expect(spy).to.have.callCount(3);
    });
  });

  it('should match a given array', () => {
    app.use(cache({
      method: ['GET', 'HEAD']
    }));
    app.use(middleware);

    const agent = request(app.callback());
    const testPath = '/';

    const requests = [];
    requests.push(new Promise((resolve) => {
      agent.get(testPath)
        .end(function(err, res) {
          expect(spy.withArgs(testPath, 'GET')).to.have.been.calledOnce;
          agent.get(testPath)
            .end(function(err, res) {
              expect(spy.withArgs(testPath, 'GET')).to.have.been.calledOnce;
              resolve();
            })
        });
    }));

    requests.push(new Promise((resolve) => {
      agent.head(testPath)
        .end(function(err, res) {
          expect(spy.withArgs(testPath, 'HEAD')).to.have.been.calledOnce;
          agent.head(testPath)
            .end(function(err, res) {
              expect(spy.withArgs(testPath, 'HEAD')).to.have.been.calledOnce;
              resolve();
            })
        });
    }));

    requests.push(new Promise((resolve) => {
      agent.post(testPath)
        .end(function(err, res) {
          expect(spy.withArgs(testPath, 'POST')).to.have.been.calledOnce;
          agent.post(testPath)
            .end(function(err, res) {
              expect(spy.withArgs(testPath, 'POST')).to.have.been.calledTwice;
              resolve();
            })
        });
    }));

    return Promise.all(requests).then(() => {
      expect(spy).to.have.callCount(4);
    });
  });

  it('should throw an error if not an expected type', () => {
    expect(cache.bind(this, {
      method: {woah: 'object'}
    })).to.throw(Error);

    expect(cache.bind(this, {
      pattern: ['/path', {woah: 'object'}]
    })).to.throw(Error);
  });
});