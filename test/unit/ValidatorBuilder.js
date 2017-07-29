'use strict';

const expect = require('../expect');
const ValidatorBuilder = require('../../src/ValidatorBuilder');

const builder = new ValidatorBuilder();
class Validator {}

describe('ValidatorBuilder', () => {
  describe('"classConstructor" setter', () => {
    it('should accept a function', () => {
      builder.classConstructor = value => value;
    });

    it('should only accept a function', () => {
      expect(() => { builder.classConstructor = 'foo'; }).to.throw(TypeError);
    });
  });

  describe('"build" method', () => {
    before(() => {
      builder.classConstructor = Validator;
    });

    it('should return an instance of classContructor', () => {
      expect(builder.build()).to.be.an.instanceof(Validator);
    });

    it('should pass first argument to validator validationFunction', () => {
      expect(builder.build(2)).to.have.property('validationFunction', 2);
    });
  });
});
