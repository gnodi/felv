'use strict';

module.exports = {
  always: false,
  catcher: false,
  handledOptions: {},
  validateOptions: options => options,
  validateAttributeValue: value => value,
  process: attributeValue => (value => (
    new Promise((resolve) => {
      setTimeout(() => resolve(value + attributeValue), 1);
    })
  ))
};
