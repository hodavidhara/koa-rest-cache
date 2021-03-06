# koa-rest-cache
[![Build Status](https://travis-ci.org/hodavidhara/koa-rest-cache.svg?branch=master)](https://travis-ci.org/hodavidhara/koa-rest-cache)

Very simple cache middleware for restful apis in [koa](https://github.com/koajs/koa). This aims to be a very thin
wrapper over your restful APIs. It simply stores the response body of requests matching a given pattern in memory.
There is no way to read, write, or clear the cache, it should just work.

## Installation

```sh
npm install koa-rest-cache
```

## Usage

```js
var app = require('koa')();
var cache = require('koa-rest-cache');

app.use(cache({
  pattern: "/api/**/*",
  maxAge: 600000 // ms
}));
```

## API

`cache(options)` A function that takes a single `options` argument, and returns a function generator that is intended
to be passed to koa's `app.use` function.

### Options

* `pattern`  A String or Array of Strings to match incoming request paths against. Supports glob matching and other
features provided by [minimatch](https://github.com/isaacs/minimatch). If no pattern is provided all requests will
be cached.
* `maxAge`  A length of time in milliseconds that something should remain in the cache. Defaults to 600000ms (10 minutes).
* `method`  A String or Array of Strings to match incoming request methods against. Defaults to `GET`
