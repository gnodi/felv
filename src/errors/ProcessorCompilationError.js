'use strict';

const ExpectationError = require('./ExpectationError');

/**
 * @class ProcessorCompilationError
 * @augments Error
 */
module.exports = class ProcessorCompilationError extends ExpectationError {
  /**
   * Constructor.
   * @param {string} subject - The subject.
   * @param {(string|Object|Array.<(string|Object)>)} expectedType - The expected type.
   * @param {*} gotValue - The got value.
   * @param {Array.<*>} [expectedValues] - The optional expected values.
   */
  constructor(subject, expectedType, gotValue, expectedValues) {
    super(null, null, subject, expectedType, gotValue, expectedValues);

    this.name = 'CompilationError';
  }
};
