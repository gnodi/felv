'use strict';

const ExpectationError = require('./ExpectationError');

/**
 * @class CompilationError
 * @augments Error
 */
module.exports = class CompilationError extends ExpectationError {
};
