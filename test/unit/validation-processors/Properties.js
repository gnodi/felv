'use strict';

require('./Abstract');

const expect = require('../../expect');
const Properties = require('../../../src/validation-processors/Properties');
const ProcessorCompilationError = require('../../../src/errors/ProcessorCompilationError');

const processingMediator = require('../../fixtures/processingMediator');

const processor = new Properties();

describe('PropertiesValidationProcessor', () => {
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
    it('should retrieve an empty option map', () => {
      expect(processor.handledOptions).to.deep.equal({});
    });
  });

  describe('"validateOptions" method', () => {
    it('should return first passed argument with no modification', () => {
      const options = {foo: 'bar'};
      expect(processor.validateOptions(options)).to.deep.equal({foo: 'bar'});
      expect(processor.validateOptions(options)).to.equal(options);
    });
  });

  describe('"validateAttributeValue" method', () => {
    it('should validate a schema and returns it unchanged', () => {
      const attributeValue = {foo: {type: 'string'}};
      expect(processor.validateAttributeValue(attributeValue)).to.deep.equal({foo: {type: 'string'}});
      expect(processor.validateAttributeValue(attributeValue)).to.equal(attributeValue);
    });

    it('should throw an error on missing value', () => {
      expect(() => processor.validateAttributeValue()).to.throw(
        ProcessorCompilationError,
        'Expected schema attribute to be a schema, got `undefined` instead'
      );
    });

    it('should throw an error on bad value', () => {
      expect(() => processor.validateAttributeValue('foo')).to.throw(
        ProcessorCompilationError,
        'Expected schema attribute to be a schema, got a string of value `"foo"` instead'
      );
    });
  });

  describe('"process" method', () => {
    it('should return a validation function on a list of items', () => {
      const validate = processor.process(
        {foo: {type: 'number'}},
        {immutable: false}
      );
      expect(validate({foo: 1})).to.deep.equal({
        value: {foo: 1},
        schema: {foo: {type: 'number'}},
        options: {immutable: false, list: false}
      });
    });
  });
});
