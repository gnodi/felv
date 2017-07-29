'use strict';

const Abstract = require('./Abstract');
const ProcessorCompilationError = require('../errors/ProcessorCompilationError');

/**
 * @class PropertiesValidationProcessor
 * @augments AbstractValidationProcessor
 */
module.exports = class PropertiesValidationProcessor extends Abstract {
  /** @inheritdoc */
  validateAttributeValue(value) {
    if (!value || typeof value !== 'object') {
      throw new ProcessorCompilationError('schema attribute', 'schema', value);
    }
    return value;
  }

  /** @inheritdoc */
  process(attributeValue, options) {
    return this[super.constructor.processingMediator].process(
      attributeValue,
      Object.assign({}, options, {list: false})
    );
  }
};
