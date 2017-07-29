'use strict';

require('./Abstract');

const expect = require('../../expect');
const ErrorProcessor = require('../../../src/validation-processors/Error');
const ProcessorCompilationError = require('../../../src/errors/ProcessorCompilationError');

const processingMediator = require('../../fixtures/processingMediator');

const processor = new ErrorProcessor();

describe('ErrorValidationProcessor', () => {
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
    it('should retrieve true', () => {
      expect(processor.catcher).to.equal(true);
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
    it('should validate a string and returns it unchanged', () => {
      const attributeValue = 'errored';
      expect(processor.validateAttributeValue(attributeValue)).to.equal('errored');
    });

    it('should throw an error on bad value', () => {
      expect(() => processor.validateAttributeValue(4)).to.throw(
        ProcessorCompilationError,
        'Expected schema attribute to be a string, got a number of value `4` instead'
      );
    });
  });

  describe('"process" method', () => {
    it('should return an error catching function forwarding error with a custom message', () => {
      const validate = processor.process('foo');
      const error = new Error('errored');
      try {
        validate(error);
        throw new Error('failed');
      } catch (err) {
        expect(err.message).to.equal('errored');
        expect(err.customMessage).to.equal('foo');
      }
    });

    it('should not overwrite custom message of an error with an already defined custom message', () => {
      const validate = processor.process('foo');
      const error = new Error('errored');
      error.customMessage = 'bar';
      try {
        validate(error);
        throw new Error('failed');
      } catch (err) {
        expect(err.message).to.equal('errored');
        expect(err.customMessage).to.equal('bar');
      }
    });
  });
});
