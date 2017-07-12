'use strict';

const constructor = Symbol('constructor');

module.exports = class ValidatorBuilder {
  /**
   * Class constructor.
   *
   * @type {function}
   *
   * @throws {TypeError} If given value is not a function.
   */
  set classConstructor(value) {
    if (typeof value !== 'function') {
      throw new TypeError(`Class constructor must be a class constructor function, got a ${typeof value} instead`);
    }
    this[constructor] = value;
  }

  /**
   * Build a validator.
   *
   * @param {function} validate - The validation function.
   *
   * @returns {Validator} A validator.
   */
  build(validate) {
    const validator = new this[constructor]();
    validator.validationFunction = validate;
    return validator;
  }
};
