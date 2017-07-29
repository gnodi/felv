'use strict';

const constructor = Symbol('constructor');

/**
 * @class ValidatorBuilder
 */
module.exports = class ValidatorBuilder {
  /**
   * Class constructor.
   * @type {function}
   * @throws {TypeError} On unexpected value.
   */
  set classConstructor(value) {
    if (typeof value !== 'function') {
      throw new TypeError(`Expected a class constructor function, got ${typeof value} instead`);
    }
    this[constructor] = value;
  }

  /**
   * Build a validator.
   * @param {function} validate - The validation function.
   * @returns {Validator} A validator.
   */
  build(validate) {
    const validator = new this[constructor]();
    validator.validationFunction = validate;
    return validator;
  }
};
