'use strict';

module.exports = {
  always: false,
  catcher: true,
  handledOptions: {},
  validateOptions: options => options,
  validateAttributeValue: value => value,
  process: attributeValue => (value) => {
    if (!attributeValue) {
      throw value;
    }
    return value.gotValue;
  }
};
