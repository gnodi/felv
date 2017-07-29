'use strict';

const Abstract = require('./Abstract');
const ProcessorCompilationError = require('../errors/ProcessorCompilationError');

/**
 * @class FormatValidationProcessor
 * @augments AbstractValidationProcessor
 */
module.exports = class FormatValidationProcessor extends Abstract {
  /** @inheritdoc */
  get handledOptions() {
    return {formatting: {}};
  }

  /** @inheritdoc */
  validateOptions(options) {
    if (!options.formatting || typeof options.formatting !== 'object') {
      throw new ProcessorCompilationError('\'formatting\' option', 'object', options.formatting);
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
    return value => attributeValue(value, options.formatting);
  }
};
