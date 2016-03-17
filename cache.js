"use strict";
const minimatch = require('minimatch');
const validation = require('./src/validation');

const DEFAULT_OPTIONS = {
  maxAge: 600000, // 10 minutes
  method: 'GET'
};

const cache = function(options) {
  const _cache = {};

  validation.validateOptions(options);
  options = Object.assign({}, DEFAULT_OPTIONS, options);

  return function*(next) {
    if (methodsMatch(options.method, this.method)) {
      const path = this.request.path;
      const cacheKey = `${this.method}|${path}`;
      const shouldCache = pathsMatch(options.pattern, path);

      if (shouldCache && _cache[cacheKey]) {
        this.body = _cache[cacheKey];
        return;
      }

      yield next;

      if (shouldCache) {
        _cache[cacheKey] = this.body;
        setTimeout(() => {
          delete _cache[cacheKey];
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

const methodsMatch = (pattern, method) => {
  let methodMatch;
  if (!pattern) {
    methodMatch = true;
  } else if (validation.isString(pattern)) {
    methodMatch = pattern.toUpperCase() === method.toUpperCase();
  } else if (pattern instanceof Array) {
    methodMatch = pattern.some((singlePattern) => {
      return singlePattern.toUpperCase() === method.toUpperCase();
    });
  } else {
    methodMatch = false;
  }
  return methodMatch;
};

module.exports = cache;