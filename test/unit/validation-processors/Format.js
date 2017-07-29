'use strict';

require('./Abstract');

const expect = require('../../expect');
const Format = require('../../../src/validation-processors/Format');
const ProcessorCompilationError = require('../../../src/errors/ProcessorCompilationError');

const processingMediator = require('../../fixtures/processingMediator');

const processor = new Format();

describe('FormatValidationProcessor', () => {
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
      expect(processor.handledOptions).to.deep.equal({formatting: {}});
    });
  });

  describe('"validateOptions" method', () => {
    it('should validate boolean value for "required" option', () => {
      const options = {formatting: {foo: 'bar'}};
      expect(processor.validateOptions(options)).to.deep.equal({formatting: {foo: 'bar'}});
      expect(processor.validateOptions(options)).to.equal(options);
    });

    it('should throw an error on not boolean value for "required" option', () => {
      const options = {formatting: 'false'};
      expect(() => processor.validateOptions(options)).to.throw(
        ProcessorCompilationError,
        'Expected \'formatting\' option to be an object, got a string of value `"false"` instead'
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
        (value, options) => value + options.offset,
        {formatting: {offset: 2}}
      );
      expect(validate(1)).to.equal(3);
    });
  });
});
