'use strict';

const validationFunction = Symbol('validationFunction');

module.exports = class Validator {
  /**
   * Validation function.
   *
   * @type {function}
   *
   * @throws {TypeError} If given value is not a function.
   */
  set validationFunction(value) {
    if (typeof value !== 'function') {
      throw new TypeError(`Validation function must be a function, got a ${typeof value} instead`);
    }
    this[validationFunction] = value;
  }

  /**
   * Validate a value.
   *
   * @param {*} value - The value.
   *
   * @returns {*} A validated value.
   *
   * @throws {Error} If validation failed.
   */
  validate(value) {
    return this[validationFunction](value);
  }
};
