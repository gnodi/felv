'use strict';

module.exports = {
  process: (schema, options) => (value => ({
    value,
    schema,
    options
  }))
};
