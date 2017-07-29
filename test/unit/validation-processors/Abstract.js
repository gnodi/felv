'use strict';

const expect = require('../../expect');
const Abstract = require('../../../src/validation-processors/Abstract');

const processingMediator = require('../../fixtures/processingMediator');

const processor = new Abstract();

describe('AbstractValidationProcessor', () => {
  describe('"processingMediator" setter', () => {
    it('should accept a processing mediator', () => {
      processor.processingMediator = processingMediator;
    });

    it('should fail to accept another value', () => {
      expect(() => { processor.processingMediator = 'foo'; }).to.throw(TypeError);
    });
  });

  describe('"processingMediator" static getter', () => {
    it('should retrieve processing mediator property name', () => {
      expect(processor[Abstract.processingMediator]).to.equal(processingMediator);
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
    it('should throw an error of missing implementation', () => {
      expect(() => processor.validateAttributeValue()).to.throw(
        '\'validateAttributeValue\' method must be implemented by \'AbstractValidationProcessor\' subclass'
      );
    });
  });

  describe('"process" method', () => {
    it('should throw an error of missing implementation', () => {
      expect(() => processor.process()).to.throw(
        '\'process\' method must be implemented by \'AbstractValidationProcessor\' subclass'
      );
    });
  });
});
