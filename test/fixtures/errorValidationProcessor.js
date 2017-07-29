'use strict';

const ProcessorCompilationError = require('../../src/errors/ProcessorCompilationError');
const ProcessorValidationError = require('../../src/errors/ProcessorValidationError');

module.exports = {
  always: false,
  catcher: false,
  handledOptions: {},
  validateOptions: options => options,
  validateAttributeValue: value => value,
  process: (attributeValue) => {
    let ErrorClass = Error;
    let args = [];
    if (attributeValue === 'compilation') {
      ErrorClass = ProcessorCompilationError;
      args = ['foo', 'not existing type'];
    } else if (attributeValue === 'validation') {
      ErrorClass = ProcessorValidationError;
      args = ['not existing type'];
    }

    return (value) => {
      throw new ErrorClass(...args, value);
    };
  }
};
