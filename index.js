'use strict';

const Compiler = require('./src/Compiler');
const Validator = require('./src/Validator');
const ValidatorBuilder = require('./src/ValidatorBuilder');

const Default = require('./src/validation-processors/Default');
const ErrorProcessor = require('./src/validation-processors/Error');
const Format = require('./src/validation-processors/Format');
const Items = require('./src/validation-processors/Items');
const Properties = require('./src/validation-processors/Properties');
const Required = require('./src/validation-processors/Required');
const Type = require('./src/validation-processors/Type');
const Validate = require('./src/validation-processors/Validate');

// Handle instantiation and dependency injection.
const validatorBuilder = new ValidatorBuilder();
validatorBuilder.classConstructor = Validator;

const compiler = new Compiler();
compiler.validatorBuilder = validatorBuilder;
compiler.setValidationProcessor('format', new Format());
compiler.setValidationProcessor('default', new Default());
compiler.setValidationProcessor('required', new Required());
compiler.setValidationProcessor('type', new Type());
compiler.setValidationProcessor('items', new Items());
compiler.setValidationProcessor('properties', new Properties());
compiler.setValidationProcessor('validate', new Validate());
compiler.setValidationProcessor('error', new ErrorProcessor());

/**
 * Compile a validation schema.
 * @param {Object} schema - The schema.
 * @param {Object} [options={}] - The validation options.
 * @returns {Validator} A validator.
 * @throws {Error} On compilation failure.
 */
exports.compile = function compile(schema, options = {}) {
  return compiler.compile(schema, options);
};

/**
 * Validate a value from a validation schema.
 * @param {Object} value - The object value.
 * @param {Object} schema - The schema.
 * @param {Object} [options={}] - The validation options.
 * @returns {Object} A validated value.
 * @throws {Error} On validation failure.
 */
exports.validate = function validate(value, schema, options = {}) {
  const validator = this.compile(schema, options);
  return validator.validate(value);
};
