'use strict';

const ProcessorValidationError = require('../../src/errors/ProcessorValidationError');
const ProcessorCompilationError = require('../../src/errors/ProcessorCompilationError');

module.exports = {
  always: false,
  catcher: false,
  handledOptions: {convertArrays: false},
  validateOptions: (options) => {
    if (typeof options.convertArrays !== 'boolean') {
      throw new Error('Expected a boolean for convertArrays option');
    }
    return options;
  },
  validateAttributeValue: (value) => {
    if (typeof value !== 'string') {
      throw new ProcessorCompilationError('attribute', 'string', value);
    }
    return value;
  },
  process: (attributeValue, options) => {
    if (attributeValue === 'error') {
      throw new Error('unexpected');
    }

    return (value) => {
      if (value === undefined) {
        return value;
      }

      const validatedValue = attributeValue === 'array' && options.convertArrays && !Array.isArray(value)
        ? [value]
        : value;
      if (value instanceof Error) {
        throw value;
      }
      if (attributeValue === 'array' && !Array.isArray(validatedValue)) {
        throw new ProcessorValidationError('array', validatedValue);
      } else if (typeof validatedValue !== attributeValue) { // eslint-disable-line valid-typeof
        throw new ProcessorValidationError(attributeValue, validatedValue);
      }
      return validatedValue;
    };
  }
};
