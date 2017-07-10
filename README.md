# felv

[![Greenkeeper badge](https://badges.greenkeeper.io/gnodi/felv.svg)](https://greenkeeper.io/)

Fast easy and light JavaScript validator.

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
    type: 'number',
    required: true
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
        type: 'boolean',
        default: true
      },
      j: {
        type: 'boolean',
        default: true
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

const validatedValue = elv.validate(
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
For repetitive validations, you should compile a validator to optimize validation performances:
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
    type: ['number', 'string']
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
    type: 'number'
    default: 3
  },
  bar: {
    type: 'number'
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
    type: 'number',
    required: true
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
        type: 'number',
        require: true
      },
      b: {
        type: 'string',
        default: 'bar'
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
    format: (value) => {
      return Array.isArray(value) ? value : [value];
    },
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
    validate: (value) => {
      if (value < 1 || value > 9) {
        throw new Error('must be a number between 1 and 9');
      }
    }
  },
  bar: {
    type: 'number',
    validate: (value) => {
      return value > 1 ? value * 10 : value;
    }
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
You can specify an error message that will be used on error occurrence:
```js
const schema = {
  foo: {
    type: 'number',
    required: true,
    error: 'You must specify a number for "foo"'
  }
};

try {
  felv.validate({foo: 'bar'}, schema);
} catch(error) {
  console.log(error.message); // Display `You must specify a number for "foo"`.
}
```

#### Validation ways
You can specify different validation ways givin an array of schemas:
```js
{
  foo: [
    {
      type: 'number',
      required: true
    },
    {
      type: 'string',
      default: 'bar'
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
- format
- default
- required
- type
- items
- properties
- validate
- error

### Options
#### Immutable
Whether or not to use the original value for validated value.
This increase performances but must not be used for cases where the original value must be preserved.

Default value:
```js
{
  immutable: false
}
```

#### Convert
Whether or not to automatically convert some value types (string to number, number to boolean, ...).

Default value:
```js
{
  convert: true
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

#### Async
Whether or not to force a `Promise` result even on synchronous return.

Default value:
```js
{
  async: false
}
```

#### Handle error
An error handler allowing to customize your error handling.

Default value:
```js
{
  handleError: (error) => {
    // Handle errors for "full" validation.
    if (error.errors) {
      throw new Error(error.errors.map(({message}) => message).join('; '));
    }

    throw new Error(`expected ${error.expected} for '${error.path}'; got ${error.got}`);
  }
}
```

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

#### Validation
A validation object to be passed as second argument (`options`) in `validate` validation processors:
```js
{
  foo: {
    validate: (value, options) => {
      // Validate value from options.
    }
  }
}
```

Default value:
```js
{
  validation: {}
}
```

## LICENSE
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
