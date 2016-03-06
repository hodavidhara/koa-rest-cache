"use strict";

const isString = (object) => {
  return typeof object === 'string' || object instanceof String;
};

const isNumber = (object) => {
  return typeof object === 'number' || object instanceof Number;
};

const assertPatternIsString = (pattern) => {
  if (!isString(pattern)) {
    throw new Error('pattern must be a string or array of strings.')
  }
};

const assertMaxAgeIsNumber = (maxeAge) => {
  if (!isNumber(maxeAge)) {
    throw new Error('maxAge must be a number.')
  }
};

const validateOptions = (options) => {
  if (options === null || options === undefined) {
    return;
  }

  const maxAge = options.maxAge;

  if (maxAge !== null && maxAge !== undefined) {
    assertMaxAgeIsNumber(maxAge)
  }

  const pattern = options.pattern;

  if (pattern !== null && pattern !== undefined) {
    if ((pattern instanceof Array)) {
      pattern.forEach(assertPatternIsString);
    } else {
      assertPatternIsString(pattern);
    }
  }
};

module.exports = {
  validateOptions,
  isString,
  isNumber
};