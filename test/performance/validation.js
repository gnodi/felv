'use strict';

const felv = require('../../index');

const simpleSchema = {foo: {type: 'string'}};
const complexSchema = {
  a: {
    required: true,
    type: 'string'
  },
  b: {
    type: Object,
    properties: {
      i: {
        required: true,
        type: 'number'
      },
      j: {
        required: true,
        type: Array,
        items: {
          type: ['number', 'string']
        }
      },
      k: {
        type: 'boolean',
        default: false
      }
    }
  },
  c: {
    format: value => [value],
    type: Array
  },
  d: {
    type: 'number',
    validate: (value, expected) => {
      if (value <= 1) {
        expected('a number greater than 1');
      }
      return value;
    }
  },
  e: {
    type: Date
  }
};

function processTest(validator, iterationNumber, value) {
  let i = 0;
  const start = Date.now();
  for (;i < iterationNumber; i++) {
    validator.validate(value);
  }
  const end = Date.now();
  console.log(`      Processed ${iterationNumber.toLocaleString()} validations in ${end - start}ms`); // eslint-disable-line no-console
}

describe('Validation', () => {
  describe('should be super fast', () => {
    it('for simple validation', () => {
      const validator = felv.compile(simpleSchema);
      processTest(validator, 1000000, {foo: 'bar'});
    });

    it('for simple not immutable validation', () => {
      const validator = felv.compile(simpleSchema, {immutable: false});
      processTest(validator, 1000000, {foo: 'bar'});
    });

    it('for complex validation', () => {
      const validator = felv.compile(complexSchema);
      processTest(validator, 100000, {
        a: 'foo',
        b: {
          i: 7,
          j: [1, 'bar', 3]
        },
        c: 1337,
        d: 42
      });
    });

    it('for complex not immutable validation', () => {
      const validator = felv.compile(complexSchema, {immutable: false});
      processTest(validator, 100000, {
        a: 'foo',
        b: {
          i: 7,
          j: [1, 'bar', 3]
        },
        c: 1337,
        d: 42
      });
    });
  });
});
