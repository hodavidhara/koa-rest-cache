"use strict";
const cache = require('../cache');
const koa = require('koa');
const request = require('supertest');

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
        const requests = testPaths.map((testPath) => {
            spy.withArgs(testPath);
            return new Promise((resolve) => {
                agent.get(testPath)
                    .end(function(err, res) {
                        expect(spy.withArgs(testPath)).to.have.been.calledOnce;
                        expect(res.body).to.deep.equal({path: testPath});
                        agent.get(testPath)
                            .end(function() {
                                expect(spy.withArgs(testPath)).to.have.been.calledOnce;
                                expect(res.body).to.deep.equal({path: testPath});
                                resolve();
                            })
                    });
            });
        });

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

        let requests = matchingPaths.map((testPath) => {
            spy.withArgs(testPath);
            return new Promise((resolve) => {
                agent.get(testPath)
                    .end(function(err, res) {
                        expect(spy.withArgs(testPath)).to.have.been.calledOnce;
                        expect(res.body).to.deep.equal({path: testPath});
                        agent.get(testPath)
                            .end(function() {
                                expect(spy.withArgs(testPath)).to.have.been.calledOnce;
                                expect(res.body).to.deep.equal({path: testPath});
                                resolve();
                            })
                    });
            });
        });

        requests = requests.concat(nonMatchingPaths.map((testPath) => {
            spy.withArgs(testPath);
            return new Promise((resolve) => {
                agent.get(testPath)
                    .end(function(err, res) {
                        expect(spy.withArgs(testPath)).to.have.been.calledOnce;
                        expect(res.body).to.deep.equal({path: testPath});
                        agent.get(testPath)
                            .end(function() {
                                expect(spy.withArgs(testPath)).to.have.been.calledTwice;
                                expect(res.body).to.deep.equal({path: testPath});
                                resolve();
                            })
                    });
            });
        }));

        return Promise.all(requests).then(() => {

            // once on each matching call, twice on each non matching call
            expect(spy).to.have.callCount(10);
        });
    });

    it('should match all patterns in a given pattern array');
    it('should throw an error if not an expected type');
});