'use strict';

const ExpectationError = require('./ExpectationError');

/**
 * @class ValidationError
 * @augments Error
 */
module.exports = class ValidationError extends ExpectationError {
  /**
   * Constructor.
   * @param {string} path - The path.
   * @param {string} [attribute] - The optional attribute name.
   * @param {(string|Object|Array.<(string|Object)>)} expectedType - The expected type.
   * @param {*} gotValue - The got value.
   * @param {Array.<*>} [expectedValues] - The optional expected values.
   */
  constructor(path, attribute, expectedType, gotValue, expectedValues) {
    super(path, attribute, 'value', expectedType, gotValue, expectedValues);
  }
};
