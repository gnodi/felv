'use strict';

require('./Abstract');

const expect = require('../../expect');
const Required = require('../../../src/validation-processors/Required');
const ProcessorCompilationError = require('../../../src/errors/ProcessorCompilationError');
const ProcessorValidationError = require('../../../src/errors/ProcessorValidationError');

const processingMediator = require('../../fixtures/processingMediator');

const processor = new Required();

describe('RequiredValidationProcessor', () => {
  describe('"processingMediator" setter', () => {
    it('should accept a processing mediator', () => {
      processor.processingMediator = processingMediator;
    });

    it('should fail to accept another value', () => {
      expect(() => { processor.processingMediator = 'foo'; }).to.throw(TypeError);
    });
  });

  describe('"always" getter', () => {
    it('should retrieve true', () => {
      expect(processor.always).to.equal(true);
    });
  });

  describe('"catcher" getter', () => {
    it('should retrieve false', () => {
      expect(processor.catcher).to.equal(false);
    });
  });

  describe('"handledOptions" getter', () => {
    it('should retrieve an option map', () => {
      expect(processor.handledOptions).to.deep.equal({required: false});
    });
  });

  describe('"validateOptions" method', () => {
    it('should validate boolean value for "required" option', () => {
      const options = {required: false};
      expect(processor.validateOptions(options)).to.deep.equal({required: false});
      expect(processor.validateOptions(options)).to.equal(options);
    });

    it('should throw an error on not boolean value for "required" option', () => {
      const options = {required: 'false'};
      expect(() => processor.validateOptions(options)).to.throw(
        ProcessorCompilationError,
        'Expected \'required\' option to be a boolean, got a string of value `"false"` instead'
      );
    });
  });

  describe('"validateAttributeValue" method', () => {
    it('should validate a boolean and returns it unchanged', () => {
      const attributeValue = true;
      expect(processor.validateAttributeValue(attributeValue)).to.equal(attributeValue);
    });

    it('should throw an error on bad value', () => {
      expect(() => processor.validateAttributeValue(2)).to.throw(
        ProcessorCompilationError,
        'Expected schema attribute to be a boolean, got a number of value `2` instead'
      );
    });
  });

  describe('"process" method', () => {
    it('should return a validation function for required value', () => {
      const validate = processor.process(
        true,
        {required: false}
      );
      expect(validate(1)).to.equal(1);
    });

    it('should not return a validation function for optional value in an optional context', () => {
      const validate = processor.process(
        false,
        {required: false}
      );
      expect(validate).to.equal();
    });

    it('should not return a validation function for optional value in a required context', () => {
      const validate = processor.process(
        false,
        {required: true}
      );
      expect(validate).to.equal();
    });

    it('should throw an error on required missing value', () => {
      const validate = processor.process(
        true,
        {required: false}
      );
      expect(() => validate()).to.throw(
        ProcessorValidationError,
        'Expected value to be a defined value, got `undefined` instead'
      );
    });

    it('should throw an error on required null value', () => {
      const validate = processor.process(
        true,
        {required: false}
      );
      expect(() => validate(null)).to.throw(
        ProcessorValidationError,
        'Expected value to be a defined value, got `null` instead'
      );
    });
  });
});
