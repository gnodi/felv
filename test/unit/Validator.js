'use strict';

const expect = require('../expect');
const Validator = require('../../src/Validator');

const validator = new Validator();

describe('Validator', () => {
  describe('"validationFunction" setter', () => {
    it('should accept a function', () => {
      validator.validationFunction = value => value;
    });

    it('should only accept a function', () => {
      expect(() => { validator.validationFunction = 'foo'; }).to.throw(TypeError);
    });
  });

  describe('"validate" method', () => {
    it('should return value validated by a validation function', () => {
      validator.validationFunction = value => value >= 1;
      expect(validator.validate(0)).to.equal(false);
      expect(validator.validate(1)).to.equal(true);
    });

    it('should forward thrown error', () => {
      validator.validationFunction = (value) => { throw new Error(value); };
      expect(() => validator.validate('foo')).to.throw('foo');
    });

    it('should handle asynchronous validation function', () => {
      validator.validationFunction = value => new Promise((resolve) => {
        setTimeout(() => {
          resolve(value * 2);
        }, 1);
      });
      return expect(validator.validate(2)).to.eventually.equal(4);
    });
  });
});
