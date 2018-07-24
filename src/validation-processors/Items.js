'use strict';

const Abstract = require('./Abstract');
const ProcessorCompilationError = require('../errors/ProcessorCompilationError');

/**
 * @class ItemsValidationProcessor
 * @augments AbstractValidationProcessor
 */
module.exports = class ItemsValidationProcessor extends Abstract {
  /** @inheritdoc */
  validateAttributeValue(value) {
    if (!value || !(typeof value === 'object' || Array.isArray(value))) {
      throw new ProcessorCompilationError('schema attribute', 'schema', value);
    }
    return value;
  }

  /** @inheritdoc */
  process(attributeValue, options) {
    const validate = this[super.constructor.processingMediator].process(
      attributeValue,
      Object.assign({}, options, {list: true})
    );

    return (value) => {
      // Allow optional value.
      if (value === null || value === undefined) {
        return value;
      }
      return validate(value);
    };
  }
};
