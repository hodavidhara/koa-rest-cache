"use strict";

const ERROR_MESSAGE_METHOD = 'method must be a string or array of strings.';
const ERROR_MESSAGE_PATTERN = 'pattern must be a string or array of strings.';
const ERROR_MESSAGE_MAX_AGE = 'maxAge must be a number.';

const isString = (object) => {
  return typeof object === 'string' || object instanceof String;
};

const isNumber = (object) => {
  return typeof object === 'number' || object instanceof Number;
};

const assertIsString = (test, errorMessage) => {
  if (!isString(test)) {
    throw new Error(errorMessage)
  }
};

const assertMaxAgeIsNumber = (maxAge) => {
  if (!isNumber(maxAge)) {
    throw new Error(ERROR_MESSAGE_MAX_AGE)
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
      pattern.forEach((singlePattern) => {
        assertIsString(singlePattern, ERROR_MESSAGE_PATTERN)
      });
    } else {
      assertIsString(pattern, ERROR_MESSAGE_PATTERN);
    }
  }

  const method = options.method;
  if (method !== null && method !== undefined) {
    if ((method instanceof Array)) {
      method.forEach((singleMethod) => {
        assertIsString(singleMethod, ERROR_MESSAGE_METHOD)
      });
    } else {
      assertIsString(method, ERROR_MESSAGE_METHOD);
    }
  }
};

module.exports = {
  validateOptions,
  isString,
  isNumber
};