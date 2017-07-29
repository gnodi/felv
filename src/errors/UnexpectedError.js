'use strict';

const error = Symbol('error');

/**
 * @class UnexpectedError
 */
module.exports = class UnexpectedError extends Error {
  /**
   * Constructor.
   * @param {Error} unexpectedError - The unexpected error.
   */
  constructor(unexpectedError) {
    super(`Unexpected error (${unexpectedError.message})`);

    this.name = 'UnexpectedError';
    this[error] = unexpectedError;
  }

  /**
   * Unexpected error.
   * @type {Error}
   */
  get error() {
    return this[error];
  }
};
