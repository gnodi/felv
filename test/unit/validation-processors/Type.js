'use strict';

require('./Abstract');

const expect = require('../../expect');
const Type = require('../../../src/validation-processors/Type');
const ProcessorCompilationError = require('../../../src/errors/ProcessorCompilationError');
const ProcessorValidationError = require('../../../src/errors/ProcessorValidationError');

const processingMediator = require('../../fixtures/processingMediator');

const processor = new Type();

describe('TypeValidationProcessor', () => {
  describe('"processingMediator" setter', () => {
    it('should accept a processing mediator', () => {
      processor.processingMediator = processingMediator;
    });

    it('should fail to accept another value', () => {
      expect(() => { processor.processingMediator = 'foo'; }).to.throw(TypeError);
    });
  });

  describe('"always" getter', () => {
    it('should retrieve false', () => {
      expect(processor.always).to.equal(false);
    });
  });

  describe('"catcher" getter', () => {
    it('should retrieve false', () => {
      expect(processor.catcher).to.equal(false);
    });
  });

  describe('"handledOptions" getter', () => {
    it('should retrieve an option map', () => {
      expect(processor.handledOptions).to.deep.equal({convert: true});
    });
  });

  describe('"validateOptions" method', () => {
    it('should validate boolean value for "convert" option', () => {
      const options = {convert: false};
      expect(processor.validateOptions(options)).to.deep.equal({convert: false});
      expect(processor.validateOptions(options)).to.equal(options);
    });

    it('should throw an error on not boolean value for "convert" option', () => {
      const options = {convert: 'false'};
      expect(() => processor.validateOptions(options)).to.throw(
        ProcessorCompilationError,
        'Expected \'convert\' option to be a boolean, got a string of value `"false"` instead'
      );
    });
  });

  describe('"validateAttributeValue" method', () => {
    it('should validate a type and returns it unchanged', () => {
      const attributeValue = 'string';
      expect(processor.validateAttributeValue(attributeValue)).to.equal(attributeValue);
    });

    it('should validate a constructor function and returns it unchanged', () => {
      const attributeValue = Array;
      expect(processor.validateAttributeValue(attributeValue)).to.equal(attributeValue);
    });

    it('should validate an array of types and constructor functions and returns it unchanged', () => {
      const attributeValue = ['string', Array, 'number', Function];
      expect(processor.validateAttributeValue(attributeValue)).to.deep.equal(
        ['string', Array, 'number', Function]
      );
    });

    it('should throw an error on bad value', () => {
      expect(() => processor.validateAttributeValue(2)).to.throw(
        ProcessorCompilationError,
        'Expected schema attribute to be a type string or constructor function, got a number of value `2` instead'
      );
    });

    it('should throw an error on bad type value', () => {
      expect(() => processor.validateAttributeValue('dumb')).to.throw(
        ProcessorCompilationError,
        'Expected schema attribute to be a string in ["boolean", "function", "number", "object", "string", "symbol"], got a string of value `"dumb"` instead'
      );
    });

    it('should throw an error on bad type value in an array of types', () => {
      const attributeValue = ['string', Array, 'number', 'dumb'];
      expect(() => processor.validateAttributeValue(attributeValue)).to.throw(
        ProcessorCompilationError,
        'Expected schema attribute to be an array of type strings and constructor functions, got an array of value `["string",null,"number","dumb"]` instead'
      );
    });
  });

  describe('"process" method', () => {
    it('should return a validation function', () => {
      const validate = processor.process(
        'number',
        processor.handledOptions
      );
      expect(validate(1)).to.equal(1);
    });

    it('should handle constructor function', () => {
      const validate = processor.process(
        Array,
        processor.handledOptions
      );
      expect(validate([1, 2, 'foo'])).to.deep.equal([1, 2, 'foo']);
    });

    it('should validate object from type', () => {
      const validate = processor.process(
        'object',
        processor.handledOptions
      );
      expect(validate({foo: 'bar'})).to.deep.equal({foo: 'bar'});
    });

    it('should validate object from constructor function', () => {
      const validate = processor.process(
        Object,
        processor.handledOptions
      );
      expect(validate({foo: 'bar'})).to.deep.equal({foo: 'bar'});
    });

    it('should validate a value from a list of types', () => {
      const validate = processor.process(
        ['string', Object, 'number'],
        processor.handledOptions
      );
      expect(validate('foo')).to.deep.equal('foo');
      expect(validate({foo: 'bar'})).to.deep.equal({foo: 'bar'});
      expect(validate(7)).to.deep.equal(7);
    });

    it('should validate null value from any type as it is considered as an optional value', () => {
      const validate = processor.process(
        'string',
        processor.handledOptions
      );
      expect(validate(null)).to.equal(null);
    });

    it('should validate undefined value from any type as it is considered as an optional value', () => {
      const validate = processor.process(
        Array,
        processor.handledOptions
      );
      let value;
      expect(validate(value)).to.equal(value);
    });

    it('should return a validation function throwing an error on bad type', () => {
      const validate = processor.process(
        'string',
        processor.handledOptions
      );
      expect(() => validate(1)).to.throw(
        ProcessorValidationError,
        'Expected value to be a string, got a number of value `1` instead'
      );
    });

    it('should return a validation function throwing an error on bad instance type', () => {
      const validate = processor.process(
        Date,
        processor.handledOptions
      );
      expect(() => validate('bar')).to.throw(
        ProcessorValidationError,
        'Expected value to be an instance of Date, got a string of value `"bar"` instead'
      );
    });

    it('should throw a more concise message for array', () => {
      const validate = processor.process(
        Array,
        processor.handledOptions
      );
      expect(() => validate('bar')).to.throw(
        ProcessorValidationError,
        'Expected value to be an array, got a string of value `"bar"` instead'
      );
    });

    it('should throw a more concise message for object', () => {
      const validate = processor.process(
        Object,
        processor.handledOptions
      );
      expect(() => validate(2)).to.throw(
        ProcessorValidationError,
        'Expected value to be an object, got a number of value `2` instead'
      );
    });

    it('should throw an error with an explicit message', () => {
      const validate = processor.process(
        'boolean',
        processor.handledOptions
      );
      expect(() => validate(new Date('1970-01-01T00:00:00.000Z'))).to.throw(
        ProcessorValidationError,
        'Expected value to be a boolean, got an instance of Date of value `"1970-01-01T00:00:00.000Z"` instead'
      );
    });

    it('should throw an error with an explicit message for a list of types', () => {
      const validate = processor.process(
        ['boolean', 'number'],
        processor.handledOptions
      );
      expect(() => validate('foo')).to.throw(
        ProcessorValidationError,
        'Expected value to be a boolean or a number, got a string of value `"foo"` instead'
      );
    });

    describe('should allow automatic conversion', () => {
      it('from "false" to false', () => {
        const validate = processor.process(
          'boolean',
          {convert: true}
        );
        expect(validate('false')).to.equal(false);
      });

      it('from "true" to true', () => {
        const validate = processor.process(
          'boolean',
          {convert: true}
        );
        expect(validate('true')).to.equal(true);
      });

      it('from "0" to false', () => {
        const validate = processor.process(
          'boolean',
          {convert: true}
        );
        expect(validate('0')).to.equal(false);
      });

      it('from "1" to true', () => {
        const validate = processor.process(
          'boolean',
          {convert: true}
        );
        expect(validate('1')).to.equal(true);
      });

      it('from 0 to false', () => {
        const validate = processor.process(
          'boolean',
          {convert: true}
        );
        expect(validate(0)).to.equal(false);
      });

      it('from "n" to n', () => {
        const validate = processor.process(
          'number',
          {convert: true}
        );
        expect(validate('42')).to.equal(42);
      });

      it('from false to 0', () => {
        const validate = processor.process(
          'number',
          {convert: true}
        );
        expect(validate(false)).to.equal(0);
      });

      it('from true to 1', () => {
        const validate = processor.process(
          'number',
          {convert: true}
        );
        expect(validate(true)).to.equal(1);
      });
    });

    it('should disable automatic conversion with "convert" option set to false', () => {
      const validate = processor.process(
        'boolean',
        {convert: false}
      );
      expect(() => validate('false')).to.throw(
        ProcessorValidationError,
        'Expected value to be a boolean, got a string of value `"false"` instead'
      );
    });

    it('should still validate not converted value with "convert" option set to false', () => {
      const validate = processor.process(
        'boolean',
        {convert: false}
      );
      expect(validate(false)).to.equal(false);
    });

    it('should fail to convert boolean with not convertible value', () => {
      const validate = processor.process(
        'boolean',
        {convert: true}
      );
      expect(() => validate([])).to.throw(
        ProcessorValidationError,
        'Expected value to be a boolean, got an array of value `[]` instead'
      );
    });

    it('should fail to convert boolean with not convertible string value', () => {
      const validate = processor.process(
        'boolean',
        {convert: true}
      );
      expect(() => validate('dumb')).to.throw(
        ProcessorValidationError,
        'Expected value to be a boolean, got a string of value `"dumb"` instead'
      );
    });

    it('should fail to convert number with not convertible value', () => {
      const validate = processor.process(
        'number',
        {convert: true}
      );
      expect(() => validate({})).to.throw(
        ProcessorValidationError,
        'Expected value to be a number, got an object of value `{}` instead'
      );
    });

    it('should fail to convert number with not convertible string value', () => {
      const validate = processor.process(
        'number',
        {convert: true}
      );
      expect(() => validate('1a3z')).to.throw(
        ProcessorValidationError,
        'Expected value to be a number, got a string of value `"1a3z"` instead'
      );
    });

    it('should disable automatic conversion for list of types', () => {
      const validate = processor.process(
        ['boolean', 'number'],
        {convert: true}
      );
      expect(() => validate('1')).to.throw(
        ProcessorValidationError,
        'Expected value to be a boolean or a number, got a string of value `"1"` instead'
      );
    });
  });
});
