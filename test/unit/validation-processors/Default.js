'use strict';

require('./Abstract');

const expect = require('../../expect');
const Default = require('../../../src/validation-processors/Default');

const processingMediator = require('../../fixtures/processingMediator');

const processor = new Default();

describe('DefaultValidationProcessor', () => {
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
    it('should validate any value and returns it unchanged', () => {
      const attributeValue = [{foo: 'bar'}];
      expect(processor.validateAttributeValue(attributeValue)).to.deep.equal([{foo: 'bar'}]);
      expect(processor.validateAttributeValue(attributeValue)).to.equal(attributeValue);
    });
  });

  describe('"process" method', () => {
    it('should return a validation function not modifying existing value', () => {
      const validate = processor.process(7);
      expect(validate(0)).to.equal(0);
    });

    it('should return a validation function replacing null value with given attribute value', () => {
      const attributeValue = [{foo: 'bar'}];
      const validate = processor.process(attributeValue);
      expect(validate(null)).to.equal(attributeValue);
      expect(processor.validateAttributeValue(attributeValue)).to.deep.equal([{foo: 'bar'}]);
    });

    it('should return a validation function replacing undefined value with given attribute value', () => {
      const attributeValue = [{foo: 'bar'}];
      const validate = processor.process(attributeValue);
      expect(validate()).to.equal(attributeValue);
      expect(processor.validateAttributeValue(attributeValue)).to.deep.equal([{foo: 'bar'}]);
    });
  });
});
