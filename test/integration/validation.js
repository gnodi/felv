'use strict';

const expect = require('../expect');
const felv = require('../../index');
const ExpectationError = require('../../src/errors/ExpectationError');
const FullValidationError = require('../../src/errors/FullValidationError');

const deathSchema = {
  a: {
    required: true,
    type: 'string'
  },
  b: {
    type: Object,
    properties: {
      i: {
        type: 'number'
      },
      j: {
        type: Array,
        items: {
          type: 'object',
          items: {
            type: Object,
            properties: {
              x: {
                type: 'number'
              },
              y: {
                default: 'felv',
                type: 'string'
              },
              z: {
                required: false,
                type: Array
              }
            }
          }
        }
      },
      k: {
        default: false,
        type: 'boolean'
      }
    }
  },
  c: {
    format: value => [value],
    type: Array,
    items: {
      type: 'number'
    }
  },
  d: {
    type: 'number',
    validate: value => (
      new Promise((resolve) => {
        setTimeout(resolve(value <= 100 ? value + 100 : value), 1);
      })
    )
  },
  e: {
    type: Date
  },
  f: {
    type: Error
  },
  g: {
    type: Array,
    items: {
      type: 'number'
    }
  },
  h: {
    type: Array,
    items: {
      type: ['number', 'string']
    }
  }
};

describe('Validation', () => {
  it('should return a validated value', () => {
    const validatedValue = felv.validate({foo: 'bar'}, {foo: {type: 'string'}});
    expect(validatedValue).to.deep.equal({foo: 'bar'});
  });

  it('should fail to validate a bad value', () => {
    const value = {foo: 1};
    expect(() => felv.validate(value, {foo: {type: 'string'}})).to.throw(
      '[$.foo](type) Expected value to be a string, got a number of value `1` instead'
    );
  });

  it('should not modify original value', () => {
    const value = {foo: 'bar'};
    const validatedValue = felv.validate(value, {foo: {type: 'string'}});
    expect(validatedValue).to.not.equal(value);
  });

  it('should handle general validation option', () => {
    const value = {foo: 'bar'};
    const validatedValue = felv.validate(
      value,
      {foo: {type: 'string'}},
      {immutable: false}
    );
    expect(validatedValue).to.equal(value);
  });

  it('should handle validation processor option', () => {
    const value = {};
    expect(() => felv.validate(
      value,
      {foo: {type: 'string'}},
      {required: true}
    )).to.throw(
      '[$.foo](required) Expected value to be a defined value, got `undefined` instead'
    );
  });

  it('should validate value with an embedded structure', () => {
    const value = {foo: [1, 3, 7]};
    const schema = {
      foo: {
        type: Array,
        items: {
          type: 'number'
        }
      }
    };
    const validatedValue = felv.validate(value, schema);
    expect(validatedValue).to.deep.equal(value);
  });

  it('should throw an explicit error message for failure on value with embedded struture', () => {
    const value = {foo: [1, 3, 'bar']};
    const schema = {
      foo: {
        type: Array,
        items: {
          type: 'number'
        }
      }
    };
    expect(() => felv.validate(value, schema)).to.throw(
      '[$.foo.2](type) Expected value to be a number, got a string of value `"bar"`'
    );
  });

  it('should handle list validation', () => {
    const value = [
      {foo: 1},
      {foo: 4},
      {}
    ];
    const schema = {
      type: Object,
      properties: {
        foo: {
          type: 'number',
          default: 3
        }
      }
    };
    const options = {list: true};
    const validatedValue = felv.validate(value, schema, options);
    expect(validatedValue).to.deep.equal([
      {foo: 1},
      {foo: 4},
      {foo: 3}
    ]);
  });

  it('should handle asynchronous validation', () => {
    const validatedValue = felv.validate(
      Promise.resolve({foo: 'bar'}),
      {foo: {type: 'string'}, bar: {default: 7}}
    );
    return expect(validatedValue).to.become({foo: 'bar', bar: 7});
  });

  it('should handle asynchronous error', () => {
    const validatedValue = felv.validate(
      Promise.resolve({foo: 1}),
      {foo: {type: 'string'}, bar: {default: 7}}
    );
    return expect(validatedValue).to.be.rejectedWith(
      ExpectationError,
      '[$.foo](type) Expected value to be a string, got a number of value `1` instead'
    );
  });

  it('should handle full validation', () => {
    const form = {
      email: 'dumb',
      password: 'dumb'
    };
    const schema = {
      firstname: {
        required: true,
        type: 'string',
        error: 'Firstname must be filled'
      },
      lastname: {
        required: true,
        type: 'string'
      },
      email: {
        required: true,
        type: 'string',
        validate: (value, expected) => {
          if (!/@/.test(value)) {
            expected('email', null, 'Email is incorrect');
          }
          return value;
        },
        error: 'Email must be filled'
      },
      password: {
        required: true,
        type: 'string',
        validate: (value, expected) => {
          if (value.length < 8) {
            expected('a string of at least 8 character');
          } else if (!/[A-Z]/.test(value)) {
            expected('a string with at least one uppercase letter');
          }
          return value;
        },
        error: 'Password must at least contains 8 characters with at least one uppercase letter'
      }
    };
    const options = {
      namespace: 'form',
      full: true
    };
    try {
      felv.validate(form, schema, options);
      throw new Error();
    } catch (error) {
      expect(error).to.be.an.instanceof(FullValidationError);
      expect(error.pathErrorMessages).to.deep.equal({
        'form.firstname': 'Firstname must be filled',
        'form.lastname': '[form.lastname](required) Expected value to be a defined value, got `undefined` instead',
        'form.email': 'Email is incorrect',
        'form.password': 'Password must at least contains 8 characters with at least one uppercase letter'
      });
      expect(error.errorMessages).to.deep.equal([
        'Email is incorrect',
        'Firstname must be filled',
        'Password must at least contains 8 characters with at least one uppercase letter',
        '[form.lastname](required) Expected value to be a defined value, got `undefined` instead'
      ]);
    }
  });

  it('should handle optional parent object', () => {
    const value = {};
    const validatedValue = felv.validate(
      value,
      {
        interface: {
          type: 'object',
          required: false,
          properties: {
            methods: {
              type: Array,
              items: {
                type: 'string'
              },
              default: []
            },
            getters: {
              type: Array,
              items: {
                type: 'string'
              },
              default: []
            },
            setters: {
              type: Array,
              items: {
                type: 'string'
              },
              default: []
            }
          }
        }
      },
      {required: true}
    );

    expect(validatedValue).to.deep.equal(value);
  });

  it('should validate README example', () => {
    const value = {
      a: 1,
      b: [2, 'foo', 4],
      c: {
        i: false
      },
      d: {
        x: 'foo',
        y: 'bar'
      }
    };
    const schema = {
      a: {
        required: true,
        type: 'number'
      },
      b: {
        type: Array,
        items: {
          type: ['string', 'number']
        }
      },
      c: {
        type: Object,
        properties: {
          i: {
            default: true,
            type: 'boolean'
          },
          j: {
            default: true,
            type: 'boolean'
          }
        }
      },
      d: {
        type: Object,
        items: {
          type: 'string'
        }
      }
    };

    expect(felv.validate(value, schema)).to.deep.equal({
      a: 1,
      b: [2, 'foo', 4],
      c: {
        i: false,
        j: true
      },
      d: {
        x: 'foo',
        y: 'bar'
      }
    });
  });

  it('should validate a value from death schema', () => {
    const date = new Date();
    const error = new Error();
    const value = {
      a: 'foo',
      b: {
        i: 7,
        j: [
          {
            foo: {
              x: 2,
              y: 'bar',
              z: []
            },
            bar: {
              x: 3
            }
          },
          {}
        ]
      },
      c: 1337,
      d: '42',
      e: date,
      f: error,
      g: [1, '23', 456],
      h: [1, '23', 456]
    };
    const options = {
      required: true
    };
    return expect(felv.validate(value, deathSchema, options)).to.become({
      a: 'foo',
      b: {
        i: 7,
        j: [
          {
            foo: {
              x: 2,
              y: 'bar',
              z: []
            },
            bar: {
              x: 3,
              y: 'felv'
            }
          },
          {}
        ],
        k: false
      },
      c: [1337],
      d: 142,
      e: date,
      f: error,
      g: [1, 23, 456],
      h: [1, '23', 456]
    });
  });

  it('should thrown an explicit error from death schema', () => {
    const date = new Date();
    const error = new Error();
    const value = {
      a: 'foo',
      b: {
        i: 7,
        j: [
          {
            foo: {
              x: 2,
              y: 'bar',
              z: []
            },
            bar: {}
          },
          {}
        ]
      },
      c: 1337,
      d: '42',
      e: date,
      f: error,
      g: [1, '23', 456],
      h: [1, '23', 456]
    };
    const options = {
      required: true,
      namespace: 'death',
      async: true
    };
    return expect(felv.validate(value, deathSchema, options)).to.be.rejectedWith(
      ExpectationError,
      '[death.b.j.0.bar.x](required) Expected value to be a defined value, got `undefined` instead'
    );
  });
});
