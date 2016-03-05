"use strict";
const minimatch = require('minimatch');

// TODO: Decide whether or not to use a timeout to remove stale items.
const cache = function(cacheProps) {
    const _cache = {};

    return function*(next) {
        if (this.method === 'GET') {
            const path = this.request.path;
            const shouldCache = shouldCache(cacheProps.pattern, path);

            if (shouldCache && _cache[path]) {
                const cached = _cache[path];
                if (Date.now() - cached.age > cacheProps.maxAge) {
                    delete _cache[path];
                } else {
                    this.body = _cache[path].data;
                    return;
                }
            }

            yield next;

            if (shouldCache) {

                _cache[path] = {
                    data: this.body,
                    age: Date.now()
                }
            }
        } else {
            yield next;
        }
    };
};

function shouldCache(pattern, path) {
    let shouldCache;
    if (typeof pattern === 'string' || pattern instanceof String) {
        shouldCache = minimatch(path, pattern);
    } else if (pattern instanceof Array) {
        shouldCache = pattern.some((pattern) => {
                return minimatch(path, pattern);
    });
    } else {
        shouldCache = false;
    }
    return shouldCache;
}

module.exports = cache;