'use strict';

const ExpectationError = require('./ExpectationError');

/**
 * @class ProcessorValidationError
 * @augments Error
 */
module.exports = class ProcessorValidationError extends ExpectationError {
  /**
   * Constructor.
   * @param {(string|Object|Array.<(string|Object)>)} expectedType - The expected type.
   * @param {*} gotValue - The got value.
   * @param {Array.<*>} [expectedValues] - The optional expected values.
   */
  constructor(expectedType, gotValue, expectedValues) {
    super(null, null, 'value', expectedType, gotValue, expectedValues);

    this.name = 'ValidationError';
  }
};
