'use strict';

const Abstract = require('./Abstract');
const ProcessorCompilationError = require('../errors/ProcessorCompilationError');
const ProcessorValidationError = require('../errors/ProcessorValidationError');

const allowedAttributeValues = ['string', 'function'];
const allowedTypes = ['boolean', 'function', 'number', 'object', 'string', 'symbol'];

/**
 * Try to convert a value to a type.
 * @param {*} value - The original value.
 * @param {string|Object} type - The type.
 * @returns {*} The converted value if successful, the original value otherwise.
 */
function convert(value, type) {
  switch (type) {
    case 'number': {
      if (typeof value === 'string') {
        const convertedValue = Number(value);
        if (!Number.isNaN(convertedValue)) {
          return convertedValue;
        }
      } else if (typeof value === 'boolean') {
        return value ? 1 : 0;
      }
      break;
    }
    case 'boolean':
      if (typeof value === 'string') {
        if (value === 'true' || value === '1') {
          return true;
        } else if (value === 'false' || value === '0') {
          return false;
        }
      } else if (typeof value === 'number') {
        return value !== 0;
      }
      break;
    default:
      return value;
  }

  return value;
}

/**
 * Validate a schema attribute value.
 * @param {*} value - The schema attribute value.
 * @returns {*} A validated schema value.
 * @throws {Error} On validation failure.
 */
function validateAttributeValue(value) {
  if (!allowedAttributeValues.includes(typeof value)) {
    throw new ProcessorCompilationError('schema attribute', 'type string or constructor function', value);
  }
  if (typeof value === 'string' && !allowedTypes.includes(value)) {
    throw new ProcessorCompilationError('schema attribute', 'string', value, allowedTypes);
  }
  return value;
}

/**
 * @class TypeValidationProcessor
 * @augments AbstractValidationProcessor
 */
module.exports = class TypeValidationProcessor extends Abstract {
  /** @inheritdoc */
  get handledOptions() {
    return {convert: true};
  }

  /** @inheritdoc */
  validateOptions(options) {
    if (typeof options.convert !== 'boolean') {
      throw new ProcessorCompilationError('\'convert\' option', 'boolean', options.convert);
    }
    return options;
  }

  /** @inheritdoc */
  validateAttributeValue(value) {
    // Handle case of a list of types.
    if (Array.isArray(value)) {
      try {
        return value.map(type => validateAttributeValue(type));
      } catch (error) {
        throw new ProcessorCompilationError(
          'schema attribute',
          'an array of type strings and constructor functions',
          value
        );
      }
    }

    // Handle case of a simple type.
    return validateAttributeValue(value);
  }

  /** @inheritdoc */
  process(attributeValue, options) {
    let validate;

    // Handle list of types case.
    if (Array.isArray(attributeValue)) {
      validate = (value) => {
        const hasValidType = attributeValue.some((type) => {
          // Handle type of case.
          if (typeof type === 'string' && typeof value !== type) { // eslint-disable-line valid-typeof
            return false;
          // Handle instance of case.
          } else if (typeof type === 'function' && !(value instanceof type)) {
            return false;
          }
          return true;
        });
        if (!hasValidType) {
          throw new ProcessorValidationError(attributeValue, value);
        }
        return value;
      };
    // Handle type of case.
    } else if (typeof attributeValue === 'string') {
      // Handle case of no allowed conversions.
      if (!options.convert) {
        validate = (value) => {
          if (typeof value !== attributeValue) { // eslint-disable-line valid-typeof
            throw new ProcessorValidationError(attributeValue, value);
          }
          return value;
        };
      // Handle case of allowed conversions.
      } else {
        validate = (value) => {
          if (typeof value === attributeValue) { // eslint-disable-line valid-typeof
            return value;
          }
          const convertedValue = convert(value, attributeValue);
          if (convertedValue === value) {
            throw new ProcessorValidationError(attributeValue, value);
          }
          return convertedValue;
        };
      }
    // Handle instance of case.
    } else {
      validate = (value) => {
        if (!(value instanceof attributeValue)) {
          throw new ProcessorValidationError(attributeValue, value);
        }
        return value;
      };
    }

    return (value) => {
      // Allow optional value.
      if (value === null || value === undefined) {
        return value;
      }
      return validate(value);
    };
  }
};
