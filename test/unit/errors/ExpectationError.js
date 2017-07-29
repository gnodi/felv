'use strict';

const expect = require('../../expect');
const ExpectationError = require('../../../src/errors/ExpectationError');

let error;

describe('ExpectationError', () => {
  describe('constructor', () => {
    it('should generate an explicit message from arguments', () => {
      const path = '$.foo.bar';
      const attribute = 'type';
      const subject = 'schema attribute';
      const expectedType = null;
      const gotValue = undefined;
      const expectedValues = ['string', 'number', 'boolean'];

      const expectationError = new ExpectationError(
        path,
        attribute,
        subject,
        expectedType,
        gotValue,
        expectedValues
      );
      expect(expectationError.message).to.equal(
        '[$.foo.bar](type) Expected schema attribute to be a value in ["string", "number", "boolean"], got `undefined` instead'
      );
    });

    it('should handle expected type', () => {
      const path = '$.foo.bar';
      const attribute = 'type';
      const subject = 'schema attribute';
      const expectedType = 'string';
      const gotValue = undefined;
      const expectedValues = ['string', 'number', 'boolean'];

      error = new ExpectationError(
        path,
        attribute,
        subject,
        expectedType,
        gotValue,
        expectedValues
      );
      expect(error.message).to.equal(
        '[$.foo.bar](type) Expected schema attribute to be a string in ["string", "number", "boolean"], got `undefined` instead'
      );
    });
  });

  describe('"value" tagged template literals', () => {
    it('should return a text corresponding to a value', () => {
      const value = 'foo';
      expect(error.value`${value}`).to.equal('"foo"');
    });

    it('should handle value before and after strings', () => {
      const value = 1;
      expect(error.value`-${value}-`).to.equal('-1-');
    });

    it('should handle object value', () => {
      const value = {foo: 'bar'};
      expect(error.value`${value}`).to.equal('{"foo":"bar"}');
    });

    it('should handle null value', () => {
      const value = null;
      expect(error.value`${value}`).to.equal('null');
    });

    it('should handle undefined value', () => {
      let value;
      expect(error.value`${value}`).to.equal('undefined');
    });

    it('should return an empty string on circular reference', () => {
      const value = {
        foo: 'bar'
      };
      value.bar = value;
      expect(error.value`-${value}-`).to.equal('');
    });

    it('should slice long serialized value to 50 characters', () => {
      const value = 'this a really long string taking too much place to be fully displayed';
      expect(error.value`${value}`).to.equal('"this a really long string taking too much place t...');
    });
  });

  describe('"values" tagged template literals', () => {
    it('should return a text corresponding to a list of values', () => {
      const values = ['foo', 'bar', 1];
      expect(error.values`${values}`).to.equal('["foo", "bar", 1]');
    });

    it('should handle value before and after strings', () => {
      const values = ['foo', 'bar', 1];
      expect(error.values`(${values})`).to.equal('(["foo", "bar", 1])');
    });

    it('should handle an empty list', () => {
      const values = [];
      expect(error.values`${values}`).to.equal('[]');
    });

    it('should handle a list with only one value', () => {
      const values = ['foo'];
      expect(error.values`${values}`).to.equal('["foo"]');
    });

    it('should handle object values', () => {
      const values = [{foo: 'bar'}, 2];
      expect(error.values`${values}`).to.equal('[{"foo":"bar"}, 2]');
    });

    it('should return an empty string for missing values', () => {
      let values;
      expect(error.values`${values}`).to.equal('');
    });

    it('should return ... for values with a circular reference', () => {
      const value = {
        foo: 'bar'
      };
      value.bar = value;
      const values = [3, value, 4];
      expect(error.values`${values}`).to.equal('[3, ..., 4]');
    });
  });

  describe('"type" tagged template literals', () => {
    it('should return a text corresponding to a type', () => {
      const type = 'string';
      expect(error.type`${type}`).to.equal('a string');
    });

    it('should return a text with an article corresponding to the type', () => {
      const type = 'object';
      expect(error.type`${type}`).to.equal('an object');
    });

    it('should handle constructor function type', () => {
      const type = Date;
      expect(error.type`${type}`).to.equal('an instance of Date');
    });

    it('should handle Array specific case', () => {
      const type = Array;
      expect(error.type`${type}`).to.equal('an array');
    });

    it('should handle basic Object specific case', () => {
      const type = Object;
      expect(error.type`${type}`).to.equal('an object');
    });

    it('should handle Function specific case', () => {
      const type = Function;
      expect(error.type`${type}`).to.equal('a constructor function');
    });

    it('should handle null type', () => {
      const type = 'null';
      expect(error.type`${type}`).to.equal('null');
    });

    it('should handle undefined type', () => {
      const type = 'undefined';
      expect(error.type`${type}`).to.equal('undefined');
    });

    it('should handle multi types', () => {
      const types = ['undefined', 'string', Date];
      expect(error.type`${types}`).to.equal('undefined or a string or an instance of Date');
    });

    it('should handle value before and after strings', () => {
      const type = 'string';
      expect(error.type` ${type} `).to.equal(' a string ');
    });

    it('should handle custom types', () => {
      const type = 'foo';
      expect(error.type`${type}`).to.equal('a foo');
    });

    it('should handle custom types starting with a vowel', () => {
      const type = 'object foo';
      expect(error.type` ${type} `).to.equal(' an object foo ');
    });

    it('should handle custom already given "a" article', () => {
      const type = 'a string';
      expect(error.type`${type}`).to.equal('a string');
    });

    it('should handle custom already given "an" article', () => {
      const type = 'an object';
      expect(error.type`${type}`).to.equal('an object');
    });

    it('should handle custom already given "of" article', () => {
      const type = 'of any type';
      expect(error.type`${type}`).to.equal('of any type');
    });

    it('should handle space for custom already given article', () => {
      const type = 'alpha';
      expect(error.type`${type}`).to.equal('an alpha');
    });

    it('should handle ` value specifier', () => {
      const type = '`3`';
      expect(error.type`${type}`).to.equal('`3`');
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
        '[$.foo.bar](default) Expected schema attribute to be a string in ["string", "number", "boolean"], got `undefined` instead'
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
      expect(error.gotValue).to.equal();
    });
  });

  describe('"path" getter', () => {
    it('should return path', () => {
      expect(error.path).to.equal('$.foo.bar');
    });
  });

  describe('"path" setter', () => {
    it('should set path', () => {
      error.path = '$.bar.foo';
      expect(error.path).to.equal('$.bar.foo');
    });

    it('should impact error message', () => {
      expect(error.message).to.equal(
        '[$.bar.foo](default) Expected schema attribute to be a string in ["string", "number", "boolean"], got `undefined` instead'
      );
    });
  });

  describe('"subject" getter', () => {
    it('should return subject', () => {
      expect(error.subject).to.equal('schema attribute');
    });
  });

  describe('"gotType" getter', () => {
    it('should return got type', () => {
      expect(error.gotType).to.equal('undefined');
    });

    it('should handle null type', () => {
      const path = '$.foo';
      const attribute = 'type';
      const subject = 'schema attribute';
      const expectedType = 'string';
      const gotValue = null;
      const expectedValues = ['string', 'number', 'boolean'];

      error = new ExpectationError(
        path,
        attribute,
        subject,
        expectedType,
        gotValue,
        expectedValues
      );

      expect(error.gotType).to.equal('null');
    });
  });
});
