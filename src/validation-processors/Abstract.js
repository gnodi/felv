'use strict';

const processingMediator = Symbol('processingMediator');

/**
 * @class AbstractValidationProcessor
 * @abstract
 */
module.exports = class AbstractValidationProcessor {
  /**
   * Processing mediator symbol.
   * @type {Symbol}
   * @static
   */
  static get processingMediator() {
    return processingMediator;
  }

  /**
   * Processing mediator.
   * @type {Object}
   * @throws {TypeError} On unexpected value.
   */
  set processingMediator(value) {
    if (!value || typeof value !== 'object' || !('process' in value)) {
      throw new TypeError(`Expected a processing mediator, got ${typeof value} instead`);
    }
    this[processingMediator] = value;
  }

  /**
   * Whether or not to use processor for each value even on missing attribute.
   * @type {boolean}
   */
  get always() {
    return false;
  }

  /**
   * Whether or not it is an error catcher processor.
   * @type {boolean}
   */
  get catcher() {
    return false;
  }

  /**
   * Handled options.
   * @type {Object.<string,*>}
   */
  get handledOptions() {
    return {};
  }

  /**
   * Validate options.
   * @param {Object} options - The options.
   * @returns {Object} Validated options.
   * @throws {Error} On validation failure.
   */
  validateOptions(options) { // eslint-disable-line
    return options;
  }

  /**
   * Validate a schema attribute value.
   * @param {*} value - The schema attribute value.
   * @returns {*} A validated schema value.
   * @throws {Error} On validation failure.
   */
  validateAttributeValue(value) { // eslint-disable-line
    throw new Error(`'validateAttributeValue' method must be implemented by '${this.constructor.name}' subclass`);
  }

  /**
   * Process validation on a value.
   * @param {*} value - The value.
   * @param {*} attributeValue - The value corresponding processor schema value.
   * @param {Object} [options={}] - The validation options.
   * @returns {function|undefined} A validation function or undefined.
   * @throws {Error} On validation failure.
   */
  process(value, attributeValue, options) { // eslint-disable-line
    throw new Error(`'process' method must be implemented by '${this.constructor.name}' subclass`);
  }
};
