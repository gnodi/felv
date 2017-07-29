'use strict';

require('./ExpectationError');

const expect = require('../../expect');
const ValidationError = require('../../../src/errors/ValidationError');

let error;

describe('ValidationError', () => {
  describe('constructor', () => {
    it('should generate an explicit message from arguments', () => {
      const path = '$.foo.bar';
      const expectedType = 'object';
      const gotValue = undefined;

      const validationError = new ValidationError(
        path,
        null,
        expectedType,
        gotValue
      );
      expect(validationError.message).to.equal(
        '[$.foo.bar] Expected value to be an object, got `undefined` instead'
      );
    });

    it('should handle optional attribute name', () => {
      const path = '$.foo.bar';
      const attribute = 'type';
      const expectedType = 'string';
      const gotValue = 1;

      const validationError = new ValidationError(
        path,
        attribute,
        expectedType,
        gotValue
      );
      expect(validationError.message).to.equal(
        '[$.foo.bar](type) Expected value to be a string, got a number of value `1` instead'
      );
    });

    it('should handle optional expected value list', () => {
      const path = '$.foo';
      const attribute = 'type';
      const expectedType = 'string';
      const gotValue = {foo: 'bar'};
      const expectedValues = ['string', 'number', 'boolean'];

      error = new ValidationError(
        path,
        attribute,
        expectedType,
        gotValue,
        expectedValues
      );
      expect(error.message).to.equal(
        '[$.foo](type) Expected value to be a string in ["string", "number", "boolean"], got an object of value `{"foo":"bar"}` instead'
      );
    });
  });

  describe('"attribute" getter', () => {
    it('should return attribute', () => {
      expect(error.attribute).to.equal('type');
    });
  });

  describe('"attribute" setter', () => {
    it('should set attribute', () => {
      error.attribute = 'default';
      expect(error.attribute).to.equal('default');
    });

    it('should impact error message', () => {
      expect(error.message).to.equal(
        '[$.foo](default) Expected value to be a string in ["string", "number", "boolean"], got an object of value `{"foo":"bar"}` instead'
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

  describe('"path" getter', () => {
    it('should return path', () => {
      expect(error.path).to.equal('$.foo');
    });
  });

  describe('"path" setter', () => {
    it('should set path', () => {
      error.path = '$.bar.foo';
      expect(error.path).to.equal('$.bar.foo');
    });

    it('should impact error message', () => {
      expect(error.message).to.equal(
        '[$.bar.foo](default) Expected value to be a string in ["string", "number", "boolean"], got an object of value `{"foo":"bar"}` instead'
      );
    });
  });

  describe('"gotType" getter', () => {
    it('should return got type', () => {
      expect(error.gotType).to.equal(Object);
    });

    it('should handle null type', () => {
      const path = '$.foo';
      const attribute = 'type';
      const expectedType = 'string';
      const gotValue = null;
      const expectedValues = ['string', 'number', 'boolean'];

      error = new ValidationError(
        path,
        attribute,
        expectedType,
        gotValue,
        expectedValues
      );

      expect(error.gotType).to.equal('null');
    });
  });

  describe('"customMessage" getter/setter', () => {
    it('should allow to set and get a custom message', () => {
      error.customMessage = 'Foo shoud be a number between 1 and 10';
      expect(error.customMessage).to.equal('Foo shoud be a number between 1 and 10');
    });
  });
});
