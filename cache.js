"use strict";
const minimatch = require('minimatch');
const validation = require('./src/validation');

const DEFAULT_OPTIONS = {
  maxAge: 600000 // 10 minutes
};

const cache = function(options) {
  const _cache = {};

  validation.validateOptions(options);
  options = Object.assign({}, DEFAULT_OPTIONS, options);

  return function*(next) {
    if (this.method === 'GET') {
      const path = this.request.path;
      const shouldCache = pathsMatch(options.pattern, path);

      if (shouldCache && _cache[path]) {
        this.body = _cache[path];
        return;
      }

      yield next;

      if (shouldCache) {
        _cache[path] = this.body;
        setTimeout(() => {
          delete _cache[path];
        }, options.maxAge);
      }
    } else {
      yield next;
    }
  };
};

const pathsMatch = (pattern, path) => {
  let pathMatch;
  if (!pattern) {
    pathMatch = true;
  } else if (validation.isString(pattern)) {
    pathMatch = minimatch(path, pattern);
  } else if (pattern instanceof Array) {
    pathMatch = pattern.some((singlePattern) => {
      return minimatch(path, singlePattern);
    });
  } else {
    pathMatch = false;
  }
  return pathMatch;
};

module.exports = cache;