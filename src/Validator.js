'use strict';

const validationFunction = Symbol('validationFunction');

/**
 * @class Validator
 */
module.exports = class Validator {
  /**
   * Validation function.
   * @type {function}
   * @throws {TypeError} On unexpected value.
   */
  set validationFunction(value) {
    if (typeof value !== 'function') {
      throw new TypeError(`Expected a function, got ${typeof value} instead`);
    }
    this[validationFunction] = value;
  }

  /**
   * Validate a value.
   * @param {*} value - The value.
   * @returns {*} A validated value.
   * @throws {Error} On validation failure.
   */
  validate(value) {
    return this[validationFunction](value);
  }
};
