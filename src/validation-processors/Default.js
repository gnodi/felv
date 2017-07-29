'use strict';

const Abstract = require('./Abstract');

/**
 * @class DefaultValidationProcessor
 * @augments AbstractValidationProcessor
 */
module.exports = class DefaultValidationProcessor extends Abstract {
  /** @inheritdoc */
  validateAttributeValue(value) {
    return value;
  }

  /** @inheritdoc */
  process(attributeValue) {
    return value => (
      value === undefined || value === null ? attributeValue : value
    );
  }
};
