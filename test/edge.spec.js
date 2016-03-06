"use strict";
const cache = require('../cache');
const koa = require('koa');
const request = require('supertest');

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
        })
    })
});