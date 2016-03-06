"use strict";
const cache = require('../cache');
const koa = require('koa');
const request = require('supertest');

describe('maxAge', () => {
    it('clears a key once it has been in the cache longer than the maxAge');
    it('should throw an error if not an expected type');
});