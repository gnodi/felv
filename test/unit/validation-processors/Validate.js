'use strict';

require('./Abstract');

const expect = require('../../expect');
const Validate = require('../../../src/validation-processors/Validate');
const ProcessorCompilationError = require('../../../src/errors/ProcessorCompilationError');
const ProcessorValidationError = require('../../../src/errors/ProcessorValidationError');

const processingMediator = require('../../fixtures/processingMediator');

const processor = new Validate();

describe('ValidateValidationProcessor', () => {
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
      expect(processor.handledOptions).to.deep.equal({validation: {}});
    });
  });

  describe('"validateOptions" method', () => {
    it('should validate boolean value for "required" option', () => {
      const options = {validation: {foo: 'bar'}};
      expect(processor.validateOptions(options)).to.deep.equal({validation: {foo: 'bar'}});
      expect(processor.validateOptions(options)).to.equal(options);
    });

    it('should throw an error on not boolean value for "required" option', () => {
      const options = {validation: 'false'};
      expect(() => processor.validateOptions(options)).to.throw(
        ProcessorCompilationError,
        'Expected \'validation\' option to be an object, got a string of value `"false"` instead'
      );
    });
  });

  describe('"validateAttributeValue" method', () => {
    it('should validate a function and returns it unchanged', () => {
      const attributeValue = () => {};
      expect(processor.validateAttributeValue(attributeValue)).to.equal(attributeValue);
    });

    it('should throw an error on bad value', () => {
      expect(() => processor.validateAttributeValue(2)).to.throw(
        ProcessorCompilationError,
        'Expected schema attribute to be a function, got a number of value `2` instead'
      );
    });
  });

  describe('"process" method', () => {
    it('should return a validation function', () => {
      const validate = processor.process(
        value => [value],
        processor.handledOptions
      );
      expect(validate(1)).to.deep.equal([1]);
    });

    it('should not return a validation function for optional value in an optional context', () => {
      const validate = processor.process(
        (value, expected, options) => value + options.offset,
        {validation: {offset: 2}}
      );
      expect(validate(1)).to.equal(3);
    });

    it('should allow to throw a ProcessorValidationError on bad value', () => {
      const validate = processor.process(
        (value, expected) => expected('`3`'),
        {}
      );
      expect(() => validate(1)).to.throw(
        ProcessorValidationError,
        'Expected value to be `3`, got a number of value `1` instead'
      );
    });

    it('should allow to throw a ProcessorValidationError with expected values', () => {
      const validate = processor.process(
        (value, expected) => expected(null, [2, 3]),
        {}
      );
      expect(() => validate(1)).to.throw(
        ProcessorValidationError,
        'Expected value to be a value in [2, 3], got a number of value `1` instead'
      );
    });

    it('should allow to throw a ProcessorValidationError with a custom message expected values', () => {
      const validate = processor.process(
        (value, expected) => expected('a number', [2, 3], 'Value must be a number between 2 and 3'),
        {}
      );
      try {
        validate(1);
        throw new Error('failed');
      } catch (err) {
        expect(err.message).to.equal('Expected value to be a number in [2, 3], got a number of value `1` instead');
        expect(err.customMessage).to.equal('Value must be a number between 2 and 3');
      }
    });
  });
});
