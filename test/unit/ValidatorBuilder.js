'use strict';

const expect = require('../expect');
const ValidatorBuilder = require('../../src/ValidatorBuilder');

const builder = new ValidatorBuilder();
class Validator {}

describe('ValidatorBuilder', () => {
  describe('"classConstructor" setter', () => {
    it('shoud accept a function', () => {
      builder.classConstructor = value => value;
    });

    it('shoud only accept a function', () => {
      expect(() => { builder.classConstructor = 'foo'; }).to.throw(TypeError);
    });
  });

  describe('"build" method', () => {
    before(() => {
      builder.classConstructor = Validator;
    });

    it('shoud return an instance of classContructor', () => {
      expect(builder.build()).to.be.an.instanceof(Validator);
    });

    it('shoud pass first argument to validator validationFunction', () => {
      expect(builder.build(2)).to.have.property('validationFunction', 2);
    });
  });
});
