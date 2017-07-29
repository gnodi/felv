'use strict';

require('./errors/CompilationError');
require('./errors/ValidationError');
require('./errors/ProcessorCompilationError');
require('./errors/ProcessorValidationError');
require('./errors/UnexpectedError');

const expect = require('../expect');
const Compiler = require('../../src/Compiler');
const CompilationError = require('../../src/errors/CompilationError');
const ExpectationError = require('../../src/errors/ExpectationError');
const FullValidationError = require('../../src/errors/FullValidationError');
const ProcessorCompilationError = require('../../src/errors/ProcessorCompilationError');
const ProcessorValidationError = require('../../src/errors/ProcessorValidationError');
const UnexpectedError = require('../../src/errors/UnexpectedError');
const ValidationError = require('../../src/errors/ValidationError');

const validatorBuilder = require('../fixtures/validatorBuilder');
const asyncValidationProcessor = require('../fixtures/asyncValidationProcessor');
const defaultValidationProcessor = require('../fixtures/defaultValidationProcessor');
const errorValidationProcessor = require('../fixtures/errorValidationProcessor');
const nullableValidationProcessor = require('../fixtures/nullableValidationProcessor');
const recoverValidationProcessor = require('../fixtures/recoverValidationProcessor');
const typeValidationProcessor = require('../fixtures/typeValidationProcessor');
const uselessValidationProcessor = require('../fixtures/uselessValidationProcessor');

const compiler = new Compiler();

describe('Compiler', () => {
  describe('"validatorBuilder" setter', () => {
    it('should accept a validator builder', () => {
      compiler.validatorBuilder = validatorBuilder;
    });

    it('should fail to accept another value', () => {
      expect(() => { compiler.validatorBuilder = 'foo'; }).to.throw(TypeError);
    });
  });

  describe('"setValidationProcessor" method', () => {
    it('should accept a validation processor', () => {
      compiler.setValidationProcessor('default', defaultValidationProcessor);
      compiler.setValidationProcessor('async', asyncValidationProcessor);
      compiler.setValidationProcessor('type', typeValidationProcessor);
      compiler.setValidationProcessor('error', errorValidationProcessor);
      compiler.setValidationProcessor('useless', uselessValidationProcessor);
      compiler.setValidationProcessor('recover', recoverValidationProcessor);
      compiler.setValidationProcessor('nullable', nullableValidationProcessor);
    });

    it('should fail to accept another value', () => {
      expect(() => { compiler.setValidationProcessor('bad', {}); }).to.throw(
        TypeError,
        'Expected a validation processor for \'bad\' attribute, got object instead'
      );
    });
  });

  describe('"process" method', () => {
    it('should throw an explicit error on missing schema argument', () => {
      expect(() => { compiler.process(); }).to.throw(
        CompilationError,
        '[$] Expected schema to be an object with properties whose values are validation processor attributes, got `undefined` instead'
      );
    });

    it('should throw an explicit error on bad schema argument', () => {
      expect(() => { compiler.process('foo', {list: true}); }).to.throw(
        CompilationError,
        '[$] Expected schema to be an object whose properties are validation processor attributes, got a string of value `"foo"` instead'
      );
    });

    it('should throw an explicit error on bad value for "async" option', () => {
      expect(() => { compiler.process('foo', {async: 'bar'}); }).to.throw(
        CompilationError,
        '[$] Expected \'async\' option to be a boolean, got a string of value `"bar"` instead'
      );
    });

    it('should throw an explicit error on bad value for "full" option', () => {
      expect(() => { compiler.process('foo', {full: 'bar'}); }).to.throw(
        CompilationError,
        '[$] Expected \'full\' option to be a boolean, got a string of value `"bar"` instead'
      );
    });

    it('should throw an explicit error on bad value for "immutable" option', () => {
      expect(() => { compiler.process('foo', {immutable: 'bar'}); }).to.throw(
        CompilationError,
        '[$] Expected \'immutable\' option to be a boolean, got a string of value `"bar"` instead'
      );
    });

    it('should throw an explicit error on bad value for "list" option', () => {
      expect(() => { compiler.process('foo', {list: 'bar'}); }).to.throw(
        CompilationError,
        '[$] Expected \'list\' option to be a boolean, got a string of value `"bar"` instead'
      );
    });

    it('should throw an explicit error on bad value for "namespace" option', () => {
      expect(() => { compiler.process('foo', {namespace: true}); }).to.throw(
        CompilationError,
        '[$] Expected \'namespace\' option to be a string, got a boolean of value `true` instead'
      );
    });

    it('should throw an explicit error on bad option', () => {
      expect(() => { compiler.process({foo: {}}, {dumb: true}); }).to.throw(
        CompilationError,
        '[$] Expected option name to be a string in ["async", "convertArrays", "full", "immutable", "list", "namespace"], got a string of value `"dumb"` instead'
      );
    });

    it('should handle custom error path prefix with "namespace" option', () => {
      expect(() => {
        compiler.process(
          {foo: {}},
          {dumb: true, namespace: 'custom'}
        );
      }).to.throw(
        CompilationError,
        '[custom] Expected option name to be a string in ["async", "convertArrays", "full", "immutable", "list", "namespace"], got a string of value `"dumb"` instead'
      );
    });

    it('should throw an explicit error on bad schema attribute', () => {
      expect(() => compiler.process({foo: {dumb: true}})).to.throw(
        CompilationError,
        '[$.foo] Expected schema attribute name to be a string in ["default", "async", "type", "error", "useless", "recover", "nullable"], got a string of value `"dumb"` instead'
      );
    });

    it('should forward unexpected error thrown by a validation processor during arguments validation', () => {
      expect(() => compiler.process(
        {foo: {type: 'string'}},
        {convertArrays: 'false'}
      )).to.throw(
        UnexpectedError,
        'Unexpected error (Expected a boolean for convertArrays option)'
      );
    });

    it('should forward unexpected error thrown by a validation processor during process', () => {
      expect(() => compiler.process(
        {foo: {type: 'error'}}
      )).to.throw(
        UnexpectedError,
        'Unexpected error (unexpected)'
      );
    });

    it('should handle validation error thrown by a validation processor', () => {
      expect(() => compiler.process({foo: {type: true}})).to.throw(
        ProcessorCompilationError,
        '[$.foo](type) Expected attribute to be a string, got a boolean of value `true` instead'
      );
    });

    it('should handle compilation error thrown by a validation processor with "list" option set to true', () => {
      expect(() => compiler.process(
        {type: true},
        {namespace: 'foo', list: true})
      ).to.throw(
        ProcessorCompilationError,
        '[foo.](type) Expected attribute to be a string, got a boolean of value `true` instead'
      );
    });

    it('should return a validation function', () => {
      const value = {foo: 'bar'};
      const validate = compiler.process({foo: {type: 'string'}});
      expect(validate(value)).to.deep.equal({foo: 'bar'});
    });

    it('should not modify original value', () => {
      const value = {foo: 'bar'};
      const validate = compiler.process({foo: {type: 'string'}});
      expect(validate(value)).to.not.equal(value);
    });

    it('should modify original value with "immutable" option set to false', () => {
      const value = {foo: 'bar'};
      const validate = compiler.process(
        {foo: {type: 'string'}},
        {immutable: false}
      );
      expect(validate(value)).to.equal(value);
    });

    it('should handle validation of list of values with "list" options set to true', () => {
      const value = [1, 3, 5];
      const validate = compiler.process(
        {type: 'number'},
        {list: true}
      );
      expect(validate(value)).to.deep.equal([1, 3, 5]);
    });

    it('should throw an explicit error on bad value structure', () => {
      const value = 1;
      const validate = compiler.process({foo: {type: 'number'}});
      expect(() => validate(value)).to.throw(
        ValidationError,
        '[$] Expected value to be an object, got a number of value `1` instead'
      );
    });

    it('should throw an explicit error on bad value structure with "list" options set to true', () => {
      const value = 1;
      const validate = compiler.process(
        {type: 'number'},
        {list: true}
      );
      expect(() => validate(value)).to.throw(
        ValidationError,
        '[$] Expected value to be an array or an object, got a number of value `1` instead'
      );
    });

    it('should throw an explicit error on value with extra properties', () => {
      const value = {foo: 2, bar: 1};
      const validate = compiler.process(
        {foo: {type: 'number'}},
        {immutable: false}
      );
      expect(() => validate(value)).to.throw(
        ValidationError,
        '[$] Expected value to be an object with properties in ["foo"], got an object of value `{"foo":2,"bar":1}` instead'
      );
    });

    it('should process schema missing properties in value', () => {
      const value = {};
      const validate = compiler.process({foo: {nullable: true}});
      expect(validate(value)).to.deep.equal({foo: null});
    });

    it('should remove undefined properties', () => {
      const value = {foo: undefined};
      const validate = compiler.process({foo: {type: 'number'}});
      return expect(validate(value)).to.deep.equal({});
    });

    it('should forward unexpected error thrown by a validation processor validation function', () => {
      const value = {foo: new Error('dumb')};
      const validate = compiler.process({foo: {type: 'string'}});
      expect(() => validate(value)).to.throw(
        UnexpectedError,
        'Unexpected error (dumb)'
      );
    });

    it('should handle validation error thrown by a validation processor validation function', () => {
      const value = {foo: 1};
      const validate = compiler.process({foo: {type: 'string'}});
      expect(() => validate(value)).to.throw(
        ProcessorValidationError,
        '[$.foo](type) Expected value to be a string, got a number of value `1` instead'
      );
    });

    it('should handle validation error thrown by a validation processor validation function with "list" option set to true', () => {
      const value = ['bar', 2];
      const validate = compiler.process(
        {type: 'string'},
        {list: true}
      );
      expect(() => validate(value)).to.throw(
        ProcessorValidationError,
        '[$.1](type) Expected value to be a string, got a number of value `2` instead'
      );
    });

    it('should throw an error aggregating all validation errors with "full" option set to true', () => {
      const value = {foo: 'bar', bar: 2};
      const validate = compiler.process(
        {foo: {type: 'number'}, bar: {type: 'string'}},
        {full: true}
      );
      let error;
      try {
        validate(value);
      } catch (err) {
        error = err;
      }
      expect(() => { throw error; }).to.throw(
        FullValidationError,
        'Errors occurred during validation'
      );
      expect(error.errors.map(({message}) => message)).to.deep.equal([
        '[$.foo](type) Expected value to be a number, got a string of value `"bar"` instead',
        '[$.bar](type) Expected value to be a string, got a number of value `2` instead'
      ]);
      expect(Object.keys(error.pathErrors)).to.deep.equal([
        '$.foo',
        '$.bar'
      ]);
    });

    it('should allow catcher processor to intercept and recover from error', () => {
      const value = {foo: 'bar'};
      const validate = compiler.process({foo: {type: 'number', recover: true}});
      expect(validate(value)).to.deep.equal({foo: 'bar'});
    });

    it('should allow catcher processor to intercept and forward an error', () => {
      const value = {foo: 'bar'};
      const validate = compiler.process({foo: {type: 'number', recover: false}});
      expect(() => validate(value)).to.throw(
        ProcessorValidationError,
        '[$.foo](type) Expected value to be a number, got a string of value `"bar"` instead'
      );
    });

    it('should not call catcher processor when no error', () => {
      const value = {foo: 2};
      const validate = compiler.process({foo: {type: 'number', recover: false}});
      expect(validate(value)).to.deep.equal({foo: 2});
    });

    it('should handle schema ways', () => {
      const value = {foo: 'bar'};
      const validate = compiler.process({foo: [
        {type: 'number'},
        {type: 'string'},
        {type: 'boolean'}
      ]});
      expect(validate(value)).to.deep.equal({foo: 'bar'});
    });

    it('should throw an explicit error on not fulfilling any schema way', () => {
      const value = {foo: 'bar'};
      const validate = compiler.process({foo: [
        {type: 'number'},
        {type: 'boolean'}
      ]});
      expect(() => validate(value)).to.throw(
        ValidationError,
        '[$.foo] Expected value to be a value validated by a schema in [{"type":"number"}, {"type":"boolean"}], got a string of value `"bar"` instead'
      );
    });

    it('should handle asynchronous validation', () => {
      const value = Promise.resolve({foo: 'bar'});
      const validate = compiler.process({foo: {type: 'string'}});
      return expect(validate(value)).to.become({foo: 'bar'});
    });

    it('should handle asynchronous validation processor', () => {
      const value = {foo: 1};
      const validate = compiler.process({foo: {async: 2}});
      return expect(validate(value)).to.become({foo: 3});
    });

    it('should handle asynchronous errors', () => {
      const value = {foo: 1};
      const validate = compiler.process({foo: {async: 1, error: ''}});
      return expect(validate(value)).to.be.rejectedWith(
        UnexpectedError,
        'Unexpected error (2)'
      );
    });

    it('should force a resolved Promise return with "async" option set to true', () => {
      const value = {foo: 1};
      const validate = compiler.process(
        {foo: {type: 'number'}},
        {async: true}
      );
      return expect(validate(value)).to.become({foo: 1});
    });

    it('should force a rejected Promise return with "async" option set to true', () => {
      const value = {foo: 3};
      const validate = compiler.process(
        {foo: {error: ''}},
        {async: true}
      );
      return expect(validate(value)).to.be.rejectedWith(
        UnexpectedError,
        'Unexpected error (3)'
      );
    });

    it('should return a rejected Promise with an error aggregating all validation errors with "full" option set to true', () => {
      const value = Promise.resolve({foo: 'bar', bar: 2});
      const validate = compiler.process(
        {foo: {type: 'number'}, bar: {type: 'string'}},
        {full: true}
      );
      return expect(validate(value)).to.be.rejectedWith(
        FullValidationError,
        'Errors occurred during validation'
      );
    });

    it('should allow catcher processor to intercept and recover from asynchronous error', () => {
      const value = Promise.resolve({foo: 'bar'});
      const validate = compiler.process({foo: {type: 'number', recover: true}});
      return expect(validate(value)).to.become({foo: 'bar'});
    });

    it('should allow catcher processor to intercept and forward an asynchronous error', () => {
      const value = Promise.resolve({foo: 'bar'});
      const validate = compiler.process({foo: {type: 'number', recover: false}});
      return expect(validate(value)).to.be.rejectedWith(
        ProcessorValidationError,
        '[$.foo](type) Expected value to be a number, got a string of value `"bar"` instead'
      );
    });

    it('should not call catcher processor when no asynchronous error', () => {
      const value = Promise.resolve({foo: 2});
      const validate = compiler.process({foo: {type: 'number', recover: false}});
      return expect(validate(value)).to.become({foo: 2});
    });

    it('should handle schema ways for asynchronous value', () => {
      const value = {foo: Promise.resolve(1)};
      const validate = compiler.process({foo: [
        {type: 'string', async: 2},
        {type: 'number', async: 1},
        {type: 'boolean'}
      ]});
      return expect(validate(value)).to.become({foo: 2});
    });

    it('should remove asynchronous undefined properties', () => {
      const value = {foo: Promise.resolve(undefined)};
      const validate = compiler.process({foo: {type: 'number'}});
      return expect(validate(value)).to.become({});
    });
  });

  describe('"compile" method', () => {
    it('should return a validator', () => {
      const value = {foo: 'bar'};
      const validator = compiler.compile({foo: {type: 'string'}});
      expect(validator.validate(value)).to.deep.equal({foo: 'bar'});
    });

    it('should handle options', () => {
      const value = {foo: 'bar'};
      const validator = compiler.compile(
        {foo: {type: 'string'}},
        {immutable: false}
      );
      expect(validator.validate(value)).to.equal(value);
    });

    it('should handle compilation error', () => {
      expect(() => compiler.compile({foo: {dumb: true}})).to.throw(ExpectationError);
    });

    it('should handle validation error', () => {
      const value = {foo: 1};
      const validator = compiler.compile({foo: {type: 'string'}});
      expect(() => validator.validate(value)).to.throw(ExpectationError);
    });
  });
});
