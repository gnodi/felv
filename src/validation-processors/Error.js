'use strict';

const Abstract = require('./Abstract');
const ProcessorCompilationError = require('../errors/ProcessorCompilationError');

/**
 * @class ErrorValidationProcessor
 * @augments AbstractValidationProcessor
 */
module.exports = class ErrorValidationProcessor extends Abstract {
  /** @inheritdoc */
  get catcher() {
    return true;
  }

  /** @inheritdoc */
  validateAttributeValue(value) {
    if (typeof value !== 'string') {
      throw new ProcessorCompilationError('schema attribute', 'string', value);
    }
    return value;
  }

  /** @inheritdoc */
  process(attributeValue) {
    return (value) => {
      if (!value.customMessage) {
        value.customMessage = attributeValue; // eslint-disable-line no-param-reassign
      }
      throw value;
    };
  }
};
