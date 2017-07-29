'use strict';

const CompilationError = require('./errors/CompilationError');
const ExpectationError = require('./errors/ExpectationError');
const FullValidationError = require('./errors/FullValidationError');
const ProcessorValidationError = require('./errors/ProcessorValidationError');
const UnexpectedError = require('./errors/UnexpectedError');
const ValidationError = require('./errors/ValidationError');

const processingOrder = Symbol('processingOrder');
const validationProcessors = Symbol('validationProcessors');
const validatorBuilder = Symbol('validatorBuilder');

/**
 * Handled options.
 * @type {Object.<string, *>}
 */
const handledOptions = {
  async: false,
  full: false,
  immutable: true,
  list: false,
  namespace: '$'
};

/**
 * Handle error.
 * @param {Error} error - The error.
 * @param {string} [path] - The optional path.
 * @param {string} [attribute] - The optional attribute name.
 * @param {Object} options - The validation options.
 * @throws {Error} Transformed or forwarded error.
 */
function handleError(error, path, attribute, options) {
  let forwardedError;
  if (error instanceof ExpectationError) {
    forwardedError = error;
    if (path) {
      if (!error.path) {
        error.path = path; // eslint-disable-line no-param-reassign
      } else {
        const mergedPathParts = [];
        const pathParts = path.split('.');
        const errorPathParts = error.path.split('.');
        const length = Math.max(pathParts.length, errorPathParts.length);
        for (let i = 0; i < length; i++) {
          mergedPathParts[i] = pathParts[i] || errorPathParts[i];
        }
        error.path = mergedPathParts.join('.'); // eslint-disable-line no-param-reassign
      }
    }
    if (attribute && !error.attribute) {
      error.attribute = attribute; // eslint-disable-line no-param-reassign
    }
  } else if (error instanceof UnexpectedError) {
    forwardedError = error;
  } else {
    forwardedError = new UnexpectedError(error);
  }

  if (
    !(
      forwardedError instanceof ValidationError
      || forwardedError instanceof ProcessorValidationError
    )
    || !options.full
  ) {
    throw forwardedError;
  }

  // Handle full validation in order to retrieve all the potential errors.
  options.full.setPathError(forwardedError.path, forwardedError);
}

/**
 * Validate options.
 * @param {Object} options - The options.
 * @returns {Object} Validated options.
 * @throws {Error} On validation failure.
 */
function validateOptions(options) {
  const validatedOptions = Object.assign({}, options);
  const path = typeof options.namespace === 'string' ? options.namespace : '$';

  if (typeof options.async !== 'boolean') {
    throw new CompilationError(path, null, '\'async\' option', 'boolean', options.async);
  }
  if (typeof options.full !== 'boolean' && !(options.full instanceof FullValidationError)) {
    throw new CompilationError(path, null, '\'full\' option', 'boolean', options.full);
  } else if (options.full === true) {
    validatedOptions.full = new FullValidationError();
  }
  if (typeof options.immutable !== 'boolean') {
    throw new CompilationError(path, null, '\'immutable\' option', 'boolean', options.immutable);
  }
  if (typeof options.list !== 'boolean') {
    throw new CompilationError(path, null, '\'list\' option', 'boolean', options.list);
  }
  if (typeof options.namespace !== 'string') {
    throw new CompilationError(path, null, '\'namespace\' option', 'string', options.namespace);
  }

  return validatedOptions;
}

/**
 * Process validation of a value.
 * @param {Object} schema - The schema.
 * @param {Object} [options={}] - The validation options.
 * @returns {Function} A validation function.
 */
function processValue(schema, options) {
  // Check schema attributes.
  const validatedSchema = Object.keys(schema).reduce((map, attribute) => {
    if (!(attribute in this[validationProcessors])) {
      throw new CompilationError(
        options.namespace,
        null,
        'schema attribute name',
        'string',
        attribute,
        this[processingOrder]
      );
    }

    try {
      map[attribute] = this[validationProcessors][attribute] // eslint-disable-line
        .validateAttributeValue(schema[attribute]);
    } catch (error) {
      handleError(error, options.namespace, attribute, options);
    }

    return map;
  }, {});

  // Build processing items.
  const processings = this[processingOrder].reduce((list, attribute) => {
    const processor = this[validationProcessors][attribute];

    if (!(attribute in validatedSchema) && !processor.always) {
      return list;
    }

    try {
      const processorProcessing = processor.process(
        validatedSchema[attribute],
        options
      );
      if (processorProcessing) {
        list.push({
          attribute,
          function: processorProcessing
        });
      }
    } catch (error) {
      handleError(error, options.namespace, attribute, options);
    }

    return list;
  }, []);

  // Return validation function.
  const validate = (value) => {
    if (value instanceof ExpectationError) {
      throw value;
    }
    return value;
  };
  const validateValue = (value, processing, processor) => {
    const isError = value instanceof ExpectationError;
    // Handle case where there is an error and the processor is a catcher.
    if (processor.catcher && isError) {
      return processing.function(value);
    // Handle case where there is an error or the processor is a catcher.
    } else if (processor.catcher || isError) {
      return value;
    }
    // Handle case where there is no error and the processor is not a catcher.
    return processing.function(value);
  };
  const handleValueError = (error, processing) => {
    try {
      return handleError(
        error,
        options.namespace,
        processing.attribute,
        Object.assign({}, options, {full: false})
      );
    } catch (err) {
      if (err instanceof ExpectationError) {
        return err;
      }
      throw err;
    }
  };

  return (value) => {
    const isPromiseValue = value instanceof Promise;

    const validatedValue = processings.reduce((result, processing) => {
      const processor = this[validationProcessors][processing.attribute];

      if (isPromiseValue || result instanceof Promise) {
        return result
          .then(validatedResult =>
            validateValue(validatedResult, processing, processor)
          )
          .catch(error => handleValueError(error, processing));
      }

      try {
        return validateValue(result, processing, processor);
      } catch (error) {
        return handleValueError(error, processing);
      }
    }, value);

    return validatedValue instanceof Promise
      ? validatedValue.then(validate)
      : validate(validatedValue);
  };
}

/**
 * Process validation ways of a value.
 * @param {Object|Array} schema - The schema.
 * @param {Object} [options={}] - The validation options.
 * @returns {Function} A validation function.
 */
function processValueWays(schema, options) {
  // Handle case of multiple ways schema.
  if (Array.isArray(schema)) {
    const ways = schema.map(way => (
      processValue.call(this, way, options)
    ));
    const handleWaysResult = (validatedValue, errors) => {
      if (errors.length === ways.length) {
        throw new ValidationError(
          options.namespace,
          null,
          'value validated by a schema',
          validatedValue,
          schema
        );
      }

      return validatedValue;
    };
    const tryWay = (value, way, index, errors) => {
      if (index > errors.length) {
        return value;
      }

      let result = value;
      try {
        result = way(value);
        if (result instanceof Promise) {
          return result.catch((error) => {
            errors.push(error);
            return value;
          });
        }
      } catch (error) {
        errors.push(error);
      }

      return result;
    };

    return (value) => {
      const errors = [];
      const validatedValue = ways.reduce((result, way, index) => (
        result instanceof Promise
          ? result.then(wayResult => tryWay(wayResult, way, index, errors))
          : tryWay(result, way, index, errors)
      ), value);

      if (validatedValue instanceof Promise) {
        return validatedValue.then(result => handleWaysResult(result, errors));
      }

      return handleWaysResult(validatedValue, errors);
    };
  }

  // Handle case of single way schema.
  return processValue.call(this, schema, options);
}

/**
 * @class Compiler
 */
module.exports = class Compiler {
  /**
   * Constructor.
   */
  constructor() {
    this[processingOrder] = [];
    this[validationProcessors] = {};
  }

  /**
   * Validator builder.
   * @type {Object}
   * @property {function} build - The build method.
   * @throws {TypeError} On unexpected value.
   */
  set validatorBuilder(value) {
    if (!value || typeof value !== 'object' || !('build' in value)) {
      throw new TypeError(`Expected a validator builder, got ${typeof value} instead`);
    }
    this[validatorBuilder] = value;
  }

  /**
   * Add a validation processor for an attribute.
   * @param {string} attribute - The attribute name.
   * @param {Object} processor - The processor.
   * @throws {TypeError} On unexpected value.
   */
  setValidationProcessor(attribute, processor) {
    if (
      !processor
      || typeof processor !== 'object'
      || !('handledOptions' in processor)
      || !('validateOptions' in processor)
      || !('validateAttributeValue' in processor)
      || !('process' in processor)
    ) {
      throw new TypeError(`Expected a validation processor for '${attribute}' attribute, got ${typeof processor} instead`);
    }
    this[processingOrder].push(attribute);
    this[validationProcessors][attribute] = processor;
    processor.processingMediator = this; // eslint-disable-line no-param-reassign
  }

  /**
   * Compile a validation schema.
   * @param {Object|Array} schema - The schema.
   * @param {Object} [options={}] - The validation options.
   * @returns {Validator} A validator.
   */
  compile(schema, options = {}) {
    const validate = this.process(schema, options);
    return this[validatorBuilder].build(validate);
  }

  /**
   * Process a validation schema.
   * @param {Object|Array} schema - The schema.
   * @param {Object} [options={}] - The validation options.
   * @returns {Function} A validation function.
   */
  process(schema, options = {}) {
    // Check options.
    let validatedOptions;
    let defaultOptions = {};
    try {
      defaultOptions = Object.keys(this[validationProcessors]).reduce(
        (obj, attribute) => (Object.assign(
          obj,
          this[validationProcessors][attribute].handledOptions
        )),
        Object.assign({}, handledOptions)
      );

      Object.keys(options).forEach((option) => {
        if (!(option in defaultOptions)) {
          throw new CompilationError(
            typeof options.namespace === 'string'
              ? options.namespace
              : defaultOptions.namespace,
            null,
            'option name',
            'string',
            option,
            Object.keys(defaultOptions).sort()
          );
        }
      });

      const mergedOptions = Object.assign({}, defaultOptions, options);
      validatedOptions = Object.keys(this[validationProcessors]).reduce(
        (obj, attribute) => (Object.assign(
          obj,
          this[validationProcessors][attribute].validateOptions(obj)
        )),
        validateOptions(mergedOptions)
      );
    } catch (error) {
      handleError(error, null, null, Object.assign({}, defaultOptions, options));
    }

    // Check schema.
    if (!schema || typeof schema !== 'object') {
      if (validatedOptions.list) {
        throw new CompilationError(
          validatedOptions.namespace,
          null,
          'schema',
          'object whose properties are validation processor attributes',
          schema
        );
      }
      throw new CompilationError(
        validatedOptions.namespace,
        null,
        'schema',
        'object with properties whose values are validation processor attributes',
        schema
      );
    }

    // Build validation function.
    const getPath = key => (
      validatedOptions.list
        ? `${validatedOptions.namespace}.${key}`
        : validatedOptions.namespace
    );
    const schemaKeys = Object.keys(schema);
    const buildValidationFunction = getProcessing => ((value) => {
      if (!value || typeof value !== 'object') {
        throw new ValidationError(
          validatedOptions.namespace,
          null,
          options.list ? [Array, Object] : Object,
          value
        );
      }

      const asynchronousValidations = [];
      let workValue = value;
      if (validatedOptions.immutable) {
        workValue = Array.isArray(value) ? [] : {};
      }
      const checkedKeys = options.list
        ? Object.keys(value)
        : schemaKeys.reduce((set, key) => {
          set.add(key);
          return set;
        }, new Set(Object.keys(value)));
      const validatedValue = [...checkedKeys].reduce((obj, key) => {
        try {
          const result = getProcessing(value, key);

          if (result instanceof Promise) {
            const asynchronousValidation = result
              .then((res) => {
                if (res === undefined) {
                  delete obj[key]; // eslint-disable-line no-param-reassign
                } else {
                  obj[key] = res; // eslint-disable-line no-param-reassign
                }
              })
              .catch((error) => {
                handleError(error, getPath(key), null, validatedOptions);
              });
            asynchronousValidations.push(asynchronousValidation);
          } else if (result === undefined) {
            delete obj[key]; // eslint-disable-line no-param-reassign
          } else {
            obj[key] = result; // eslint-disable-line no-param-reassign
          }
        } catch (error) {
          handleError(error, getPath(key), null, validatedOptions);
        }

        return obj;
      }, workValue);

      return asynchronousValidations.length === 0
        ? validatedValue
        : Promise.all(asynchronousValidations).then(() => validatedValue);
    });
    let validate;

    // Handle case of a list (array or object).
    if (validatedOptions.list === true) {
      const processing = processValueWays.call(
        this,
        schema,
        Object.assign({}, validatedOptions, {namespace: `${validatedOptions.namespace}.`})
      );

      validate = buildValidationFunction((value, key) => (
        processing(value[key])
      ));
    // Handle case of an object with properties.
    } else {
      const processings = Object.keys(schema).reduce((map, property) => {
        map[property] = processValueWays.call( // eslint-disable-line no-param-reassign
          this,
          schema[property],
          Object.assign({}, validatedOptions, {namespace: `${validatedOptions.namespace}.${property}`})
        );
        return map;
      }, {});

      validate = buildValidationFunction((value, key) => {
        if (!(key in processings)) {
          throw new ValidationError(
            `${validatedOptions.namespace}`,
            null,
            'object with properties',
            value,
            Object.keys(processings)
          );
        }
        return processings[key](value[key]);
      });
    }

    const checkValidatedValue = (validatedValue) => {
      if (validatedOptions.full && validatedOptions.full.errors.length !== 0) {
        throw validatedOptions.full;
      }
      return validatedValue;
    };

    // Return asynchronous validation wrapper.
    return (value) => {
      // Force Promise return for async validation.
      if (options.async) {
        return new Promise((resolve, reject) => {
          try {
            const validatedValue = validate(value);
            resolve(validatedValue);
          } catch (error) {
            reject(error);
          }
        }).then(validatedValue => checkValidatedValue(validatedValue));
      }

      const validatedValue = value instanceof Promise
        ? value.then(result => validate(result))
        : validate(value);
      return validatedValue instanceof Promise
        ? validatedValue.then(result => checkValidatedValue(result))
        : checkValidatedValue(validatedValue);
    };
  }
};
