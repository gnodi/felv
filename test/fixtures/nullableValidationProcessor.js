'use strict';

module.exports = {
  always: false,
  catcher: false,
  handledOptions: {},
  validateOptions: options => options,
  validateAttributeValue: value => value,
  process: () => value => (value === undefined ? null : value)
};
