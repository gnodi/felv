'use strict';

module.exports = {
  always: false,
  catcher: false,
  handledOptions: {},
  validateOptions: options => options,
  validateAttributeValue: value => value,
  process: attributeValue => (value => (
    value === undefined || value === null
      ? attributeValue
      : value
  ))
};
