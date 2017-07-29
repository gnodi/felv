# felv

**felv** is a fast easy and light (synchronous and asynchronous) JavaScript validator.

- Take only **2 minutes** to know if felv is made for you.
- Take only **5 minutes** to try it.
- Take only **15 minutes** to read this page and learn everything you need to know!

[![Build][build-image]][build-url]
[![Coverage Status][coverage-image]][coverage-url]
[![Version][version-image]][version-url]
[![Downloads][downloads-image]][downloads-url]
[![Dependencies][dependencies-image]][dependencies-url]
[![Dev Dependencies][dev-dependencies-image]][dev-dependencies-url]

## Installation
Run the following command to add the package to your dev dependencies:
```sh
$ npm install --save felv
```

## Use
```js
const felv = require('felv');
```

### Example
```js
const schema = {
  // Value of 'a' key is required and must be a number.
  a: {
    required: true,
    type: 'number'
  },
  // Value of 'b' key is an array of numbers and strings.
  b: {
    type: Array,
    items: {
      type: ['string', 'number']
    }
  },
  // Value of 'c' key is an instance of Object
  // with properties i and j which are booleans
  // of default value `true`.
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
  // Value of 'd' key is an instance of Object
  // with properties of variable names and string values.
  d: {
    type: Object,
    items: {
      type: 'string'
    }
  }
};

const validatedValue = felv.validate(
  {
    a: 1,
    b: [2, 'foo', 4],
    c: {
      i: false
    },
    d: {
      x: 'foo',
      y: 'bar'
    }
  },
  schema
);
```

`validatedValue` is equal to:
```js
{
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
}
```

### Validation
#### Simple
You can easily validate a value from a schema:
```js
const validatedValue = felv.validate(value, schema, options);
```

#### From a compiled schema
For repetitive validations, you should compile a validator to optimize validation performances. This can also be useful to detect schema format errors before validation occurs.
```js
const validator = felv.compile(schema, options);
const validatedValue = validator.validate(value);
```

### Schema
A schema is used to describe the format of a value. Each attribute of a schema is called a validation processor. A schema can embed other schemas to describe embedded structures thanks to some validation processors.

#### Validation processors list
##### Type
You can check the type of the value of a key:
```js
{
  foo: {
    type: 'number'
  },
  bar: {
    type: Date
  },
  foobar: {
    type: ['number', 'string'] // number or string items
  }
}
```

Matching values:
```js
{
  foo: 2,
  bar: new Date(),
  foobar: 3
}

{
  foo: 2,
  bar: new Date(),
  foobar: 'foo'
}
```

##### Default
You can specify a default value:
```js
{
  foo: {
    default: 3,
    type: 'number'
  },
  bar: {
    default: 6
  }
}
```

Matching value:
```js
{
  foo: 2
}
```

Validated value:
```js
{
  foo: 2,
  bar: 6
}
```

##### Required
You can specify a required value:
```js
{
  foo: {
    required: true,
    type: 'number'
  },
  bar: {
    type: 'number'
  }
}
```

Matching value:
```js
{
  foo: 2
}
```

##### Items
You can specify embedded items of arrays and objects:
```js
{
  foo: {
    type: Array,
    items: {
      type: 'number'
    }
  },
  bar: {
    type: Object,
    items: {
      type: 'number'
    }
  }
}
```

Matching value:
```js
{
  foo: [2, 3, 7],
  bar: {a: 1, b: 5}
}
```

##### Properties
You can specify properties of objects:
```js
{
  foo: {
    type: Object,
    properties: {
      a: {
        required: true,
        type: 'number'
      },
      b: {
        default: 'bar',
        type: 'string'
      }
    }
  }
}
```

Matching value:
```js
{
  foo: {a: 4}
}
```

Validated value:
```js
{
  foo: {a: 4, b: 'bar'}
}
```

##### Format
You can give a function to format input values:
```js
{
  foo: {
    format: value => (Array.isArray(value) ? value : [value]),
    type: Array,
    items: {
      type: 'string'
    }
  }
}
```

Matching value:
```js
{
  foo: 'bar'
}
```

Validated value:
```js
{
  foo: ['bar']
}
```

##### Validate
You can give a function to make custom validations and format output values:
```js
{
  foo: {
    type: 'number',
    validate: (value, expected) => {
      if (value < 1 || value > 9) {
        // Throw a validation error.
        expected('a number between 1 and 9');
      }
      return value;
    }
  },
  bar: {
    type: 'number',
    // Alter validated value.
    validate: value => (value > 1 ? value * 10 : value)
  }
}
```

Matching value:
```js
{
  foo: 4,
  bar: 2
}
```

Validated value:
```js
{
  foo: 4,
  bar: 20
}
```

##### Error
You can specify a custom error message that will be set on error occurrence:
```js
const schema = {
  foo: {
    required: true,
    type: 'number',
    error: 'You must specify a number for "foo"'
  }
};

try {
  felv.validate({foo: 'bar'}, schema);
} catch(error) {
  console.log(error.customMessage); // Display `You must specify a number for "foo"`.
}
```

#### Validation ways
You can specify different validation ways givin an array of schemas:
```js
{
  foo: [
    {
      required: true,
      type: 'number'
    },
    {
      default: 'bar',
      type: 'string'
    }
  ]
}
```

Matching values:
```js
{foo: 2}

{foo: 'foo'}

{}
```

Corresponding validated values:
```js
{foo: 2}

{foo: 'foo'}

{foo: 'bar'}
```

#### Asynchronous validation
You can use asynchronous functions in validation processors accepting a function (like `format` and `validate`) or directly return a `Promise`. In that case, a `Promise` will be returned by the `validate` method.

Example:
```js
const asyncSchema = {
  foo: {
    validate: async (value) => {
      const validatedValue = await asyncValidationFunction(value);
      return validatedValue + 1;
    }
  },
  bar: {
    format: (value) => {
      return new Promise((resolve, reject) => {
        asyncFormattingFunction(formattedValue => resolve(formattedValue));
      });
    }
  }
};
const validatedValue = await felv.validate({foo: 3, bar: 4}, asyncSchema);
```

#### Validation processors dependencies
For simplicity, validation processors are independent from each other.

#### Validation processors order
Validation processors are processed in a specific order:
1. format
2. default
3. required
4. type
5. items
6. properties
7. validate
8. error

### Options
You can modulate validation with following options:
- async
- convert
- formatting
- full
- immutable
- list
- namespace
- required
- validation

#### Async
Whether or not to force a `Promise` result even on synchronous return.

Default value:
```js
{
  async: false
}
```

#### Convert
Whether or not to automatically convert some value types.

Default value:
```js
{
  convert: true
}
```

string => boolean:
- `"false"` => `false`
- `"true"` => `true`
- `"0"` => `false`
- `"1"` => `true`

number => boolean:
- `0` => `false`
- `>0` => `true`

string => number:
`"100"` => `100`

boolean => number:
`false` => `0`
`true` => `1`

#### Formatting
A validation object to be passed as second argument (`options`) in `format` validation processors:
```js
{
  foo: {
    format: (value, options) => {
      // Format value from options.
    }
  }
}
```

Default value:
```js
{
  formatting: {}
}
```

#### Full
Whether or not to process full validation event after a first error occurred.

Default value:
```js
{
  full: false
}
```

#### Immutable
Whether or not to use the original value for validated value.
This increase performances but must not be used for cases where the original value must be preserved.

Default value:
```js
{
  immutable: false
}
```

#### List
Whether or not to process schema on a list of items (array or object) instead of an object with defined properties.

Default value:
```js
{
  list: false
}
```

#### Namespace
A namespace to prefix paths in error messages.

Default value:
```js
{
  namespace: '$'
}
```

#### Required
Whether or not fields are required by default.

Default value:
```js
{
  required: false
}
```

#### Validation
A validation object to be passed as third argument (`options`) in `validate` validation processors:
```js
{
  foo: {
    validate: (value, expected, options) => {
      // Validate 'value' from 'options'.
      // Throw validation error with 'expected'.
    }
  }
}
```
> `expected` function take 3 arguments:
> - `{string} expectedType`: Expected type (or value description)
> - `{Array.<*>} [expectedValues]`: Optional expected values
> - `{string} [customMessage]`: Optional custom error message

Default value:
```js
{
  validation: {}
}
```

### Error handling
#### Simple example
```js
const validator = felv.compile({foo: {type: 'string'}});
try {
  const validatedValue = validator.validate({foo: 3});
} catch (error) {
  // Error type: 'ValidationError'
  console.log(error.name);
  // Explicit message: '[$.foo](type) Expected value to be a string, got a number of value `3` instead'
  console.log(error.message);
  // Path of the failing value: '$.foo'
  console.log(error.path);
  // Failing schema attribute/validation processor: 'type'
  console.log(error.attribute);
  // Subject of failure: 'value'
  console.log(error.subject);
  // Expected type: 'string'
  console.log(error.expectedType);
  // Expected values: []
  console.log(error.expectedValues);
  // Got(gotten) type: 'number'
  console.log(error.gotValue);
  // Got(gotten) value: 3
  console.log(error.gotValue);
  // Custom message (not defined here): ''
  console.log(error.customMessage);
}
```

#### Full validation example
You can process full validation to retrieve all validation errors of a value against a schema.
This can be useful to validate a user form and return all errors for instance:
```js
// Compile form schema at program initialization.
const schema = {
  firstname: {
    required: true,
    type: 'string',
    // Define custom error message of occuring validation error.
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
        // Define custom error message with third argument
        // of expected function.
        expected('email', null, 'Email is incorrect');
      }
      return value;
    },
    // `error` attribute does not overwrite already defined custom message
    // like 'Email is incorrect' in above validate attribute function.
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
const validator = felv.compile(schema, options);
```

```js
// Use compiled validator to validate user input on user subscription.
// We assume `req.body` equals `{email: 'dumb', password: 'dumb'}`
try {
  const validatedValue = validator.validate({
    firstname: req.body.firstname,
    lastname: req.body.lastname,
    email: req.body.email,
    password: req.body.email
  });
  // Do stuff like persisting user in database...
} catch (error) {
  // Error type: 'FullValidationError'
  console.log(error.name);
  // Use `error.pathErrorMessages` to get validation error messages associated with failing paths.
  assert.deepEqual(error.pathErrorMessages, {
    'form.firstname': 'Firstname must be filled',
    'form.lastname': '[form.lastname](required) Expected value to be a defined value, got `undefined` instead',
    'form.email': 'Email is incorrect',
    'form.password': 'Password must at least contains 8 characters with at least one uppercase letter'
  });
  // Use `error.pathErrors` to get the validation errors instead of messages.
  // Use `error.errorMessages` to get validation error message list.
  assert.deepEqual(error.errorMessages, [
    'Email is incorrect',
    'Firstname must be filled',
    'Password must at least contains 8 characters with at least one uppercase letter',
    '[form.lastname](required) Expected value to be a defined value, got `undefined` instead'
  ]);
  // Use `error.errors` to get the validation errors instead of messages.
}
```

### Testing
Many `npm` scripts are available to help testing:
```sh
$ npm run {script}
```
- `check`: lint and check unit and integration tests
- `lint`: lint
- `test`: check unit tests
- `test-coverage`: check coverage of unit tests
- `test-debug`: debug unit tests
- `test-integration`: check integration tests
- `test-performance`: check performance (just for fun)
- `test-watch`: work in TDD!

Use `npm run check` to check that everything is ok.

## Contributing
If you want to contribute, just fork this repository and make a pull request!

Your development must respect these rules:
- fast
- easy
- light

You must keep test coverage at 100%.

## License
[MIT](LICENSE)

[build-image]: https://img.shields.io/travis/gnodi/felv.svg?style=flat
[build-url]: https://travis-ci.org/gnodi/felv
[coverage-image]:https://coveralls.io/repos/github/gnodi/felv/badge.svg?branch=master
[coverage-url]:https://coveralls.io/github/gnodi/felv?branch=master
[version-image]: https://img.shields.io/npm/v/felv.svg?style=flat
[version-url]: https://npmjs.org/package/felv
[downloads-image]: https://img.shields.io/npm/dm/felv.svg?style=flat
[downloads-url]: https://npmjs.org/package/felv
[dependencies-image]:https://david-dm.org/gnodi/felv.svg
[dependencies-url]:https://david-dm.org/gnodi/felv
[dev-dependencies-image]:https://david-dm.org/gnodi/felv/dev-status.svg
[dev-dependencies-url]:https://david-dm.org/gnodi/felv#info=devDependencies
