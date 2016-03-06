"use strict";
const minimatch = require('minimatch');

const DEFAULT_PROPS = {
    maxAge: 600000 // 10 minutes
};

const pathsMatch = (pattern, path) => {
    let pathMatch;
    if (!pattern) {
        pathMatch = true;
    } else if (typeof pattern === 'string' || pattern instanceof String) {
        pathMatch = minimatch(path, pattern);
    } else if (pattern instanceof Array) {
        pathMatch = pattern.some((pattern) => {
            return minimatch(path, pattern);
        });
    } else {
        pathMatch = false;
    }
    return pathMatch;
};

const cache = function(cacheProps) {
    const _cache = {};
    cacheProps = Object.assign({}, DEFAULT_PROPS, cacheProps);

    return function*(next) {
        if (this.method === 'GET') {
            const path = this.request.path;
            const shouldCache = pathsMatch(cacheProps.pattern, path);

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

module.exports = cache;