'use strict';

const Abstract = require('./Abstract');
const ProcessorCompilationError = require('../errors/ProcessorCompilationError');
const ProcessorValidationError = require('../errors/ProcessorValidationError');

/**
 * Helper function to throw a ProcessorValidationError.
 * @param {(string|Object|Array.<(string|Object)>)} expectedType - The expected type.
 * @param {*} gotValue - The got value.
 * @param {Array.<*>} [expectedValues] - The optional expected values.
 * @param {string} [customErrorMessage] - The validation error custom message.
 * @throws {ProcessorValidationError} On all paths.
 */
function expected(expectedType, gotValue, expectedValues, customErrorMessage) {
  const error = new ProcessorValidationError(expectedType, gotValue, expectedValues);
  if (customErrorMessage) {
    error.customMessage = customErrorMessage;
  }
  throw error;
}

/**
 * @class ValidateValidateProcessor
 * @augments AbstractValidateProcessor
 */
module.exports = class ValidateValidationProcessor extends Abstract {
  /** @inheritdoc */
  get handledOptions() {
    return {validation: {}};
  }

  /** @inheritdoc */
  validateOptions(options) {
    if (!options.validation || typeof options.validation !== 'object') {
      throw new ProcessorCompilationError('\'validation\' option', 'object', options.validation);
    }
    return options;
  }

  /** @inheritdoc */
  validateAttributeValue(value) {
    if (typeof value !== 'function') {
      throw new ProcessorCompilationError('schema attribute', 'function', value);
    }
    return value;
  }

  /** @inheritdoc */
  process(attributeValue, options) {
    return value => attributeValue(
      value,
      (expectedType, expectedValues, customErrorMessage) =>
        expected(expectedType, value, expectedValues, customErrorMessage),
      options.validation
    );
  }
};
