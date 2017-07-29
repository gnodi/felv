'use strict';

require('./ExpectationError');

const expect = require('../../expect');
const ProcessorValidationError = require('../../../src/errors/ProcessorValidationError');

let error;

describe('ProcessorValidationError', () => {
  describe('constructor', () => {
    it('should generate an explicit message from arguments', () => {
      const expectedType = 'object';
      const gotValue = undefined;

      const validationError = new ProcessorValidationError(
        expectedType,
        gotValue
      );
      expect(validationError.message).to.equal(
        'Expected value to be an object, got `undefined` instead'
      );
    });

    it('should handle optional expected value list', () => {
      const expectedType = 'string';
      const gotValue = {foo: 'bar'};
      const expectedValues = ['string', 'number', 'boolean'];

      error = new ProcessorValidationError(
        expectedType,
        gotValue,
        expectedValues
      );
      expect(error.message).to.equal(
        'Expected value to be a string in ["string", "number", "boolean"], got an object of value `{"foo":"bar"}` instead'
      );
    });
  });

  describe('"path" setter', () => {
    it('should set path', () => {
      error.path = '$.bar.foo';
      expect(error.path).to.equal('$.bar.foo');
    });

    it('should impact error message', () => {
      expect(error.message).to.equal(
        '[$.bar.foo] Expected value to be a string in ["string", "number", "boolean"], got an object of value `{"foo":"bar"}` instead'
      );
    });
  });

  describe('"attribute" getter', () => {
    it('should return null just after error instantiation', () => {
      expect(error.attribute).to.equal(null);
    });
  });

  describe('"attribute" setter', () => {
    it('should set attribute', () => {
      error.attribute = 'default';
      expect(error.attribute).to.equal('default');
    });

    it('should impact error message', () => {
      expect(error.message).to.equal(
        '[$.bar.foo](default) Expected value to be a string in ["string", "number", "boolean"], got an object of value `{"foo":"bar"}` instead'
      );
    });
  });

  describe('"customMessage" getter', () => {
    it('should get an empty message if there is no custom message defined', () => {
      expect(error.customMessage).to.equal('');
    });
  });

  describe('"customMessage" setter', () => {
    it('should set custom message', () => {
      error.customMessage = 'errored';
      expect(error.customMessage).to.equal('errored');
    });
  });

  describe('"expectedType" getter', () => {
    it('should return expected type', () => {
      expect(error.expectedType).to.equal('string');
    });
  });

  describe('"expectedValues" getter', () => {
    it('should return expected values', () => {
      expect(error.expectedValues).to.deep.equal(['string', 'number', 'boolean']);
    });
  });

  describe('"gotValue" getter', () => {
    it('should return got value', () => {
      expect(error.gotValue).to.deep.equal({foo: 'bar'});
    });
  });
});
