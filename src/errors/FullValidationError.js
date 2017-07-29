'use strict';

const errors = Symbol('errors');

/**
 * @class FullValidationError
 */
module.exports = class FullValidationError extends Error {
  /**
   * Constructor.
   */
  constructor() {
    super('Errors occurred during validation');

    this.name = 'FullValidationError';
    this[errors] = {};
  }

  /**
   * Set path error.
   * @param {string} path - The path.
   * @param {Error} error - The error.
   */
  setPathError(path, error) {
    this[errors][path] = error;
  }

  /**
   * Path errors.
   * @type {Object.<string,Error>}
   */
  get pathErrors() {
    return this[errors];
  }

  /**
   * Path error list.
   * @type {Array.<Error>}
   */
  get errors() {
    return Object.keys(this[errors])
      .map(path => this[errors][path]);
  }

  /**
   * Path error messages.
   * @type {Object.<string,Error>}
   */
  get pathErrorMessages() {
    return Object.keys(this[errors]).reduce((map, path) => {
      const error = this[errors][path];
      map[path] = error.customMessage || error.message; // eslint-disable-line no-param-reassign
      return map;
    }, {});
  }

  /**
   * Path error message list.
   * @type {Array.<Error>}
   */
  get errorMessages() {
    return Object.keys(this[errors])
      .map((path) => {
        const error = this[errors][path];
        return error.customMessage || error.message; // eslint-disable-line no-param-reassign
      })
      .sort();
  }
};
