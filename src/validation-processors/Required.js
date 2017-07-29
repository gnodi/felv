'use strict';

const Abstract = require('./Abstract');
const ProcessorCompilationError = require('../errors/ProcessorCompilationError');
const ProcessorValidationError = require('../errors/ProcessorValidationError');

/**
 * @class RequiredValidationProcessor
 * @augments AbstractValidationProcessor
 */
module.exports = class RequiredValidationProcessor extends Abstract {
  /** @inheritdoc */
  get always() {
    return true;
  }

  /** @inheritdoc */
  get handledOptions() {
    return {required: false};
  }

  /** @inheritdoc */
  validateOptions(options) {
    if (typeof options.required !== 'boolean') {
      throw new ProcessorCompilationError('\'required\' option', 'boolean', options.required);
    }
    return options;
  }

  /** @inheritdoc */
  validateAttributeValue(value) {
    if (typeof value !== 'boolean') {
      throw new ProcessorCompilationError('schema attribute', 'boolean', value);
    }
    return value;
  }

  /** @inheritdoc */
  process(attributeValue, options) {
    if (
      (attributeValue !== true && !options.required)
      || attributeValue === false
    ) {
      return;
    }

    return (value) => { // eslint-disable-line consistent-return
      if (value === undefined || value === null) {
        throw new ProcessorValidationError('defined value', value);
      }
      return value;
    };
  }
};
