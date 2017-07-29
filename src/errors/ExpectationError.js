'use strict';

const attribute = Symbol('attribute');
const customMessage = Symbol('customMessage');
const expectedType = Symbol('expectedType');
const expectedValues = Symbol('expectedValues');
const gotType = Symbol('gotType');
const gotValue = Symbol('gotValue');
const path = Symbol('path');
const subject = Symbol('subject');
const generateMessage = Symbol('generateMessage');

const textMaxLength = 50;
const vowels = ['a', 'e', 'i', 'o'];

/**
 * @class ExpectationError
 * @abstract
 */
module.exports = class ExpectationError extends Error {
  /**
   * Constructor.
   * @param {string} path - The path.
   * @param {string} [attribute] - The optional attribute name.
   * @param {string} subject - The subject.
   * @param {(string|Object|Array.<(string|Object)>)} expectedType - The expected type.
   * @param {*} gotValue - The got value.
   * @param {Array.<*>} [expectedValues] - The optional expected values.
   */
  constructor(path_, attribute_, subject_, expectedType_, gotValue_, expectedValues_) {
    super();

    this.name = this.constructor.name;

    let gotValueType = gotValue_ && typeof gotValue_ === 'object' && gotValue_.constructor
      ? gotValue_.constructor
      : typeof gotValue_;
    if (gotValue_ === null) {
      gotValueType = 'null';
    }

    this[attribute] = attribute_;
    this[expectedType] = expectedType_ || 'a value';
    this[expectedValues] = expectedValues_;
    this[gotType] = gotValueType;
    this[gotValue] = gotValue_;
    this[path] = path_;
    this[subject] = subject_;

    this[customMessage] = '';
    this[generateMessage]();
  }

  /**
   * Tagged template literals for a value.
   * @param {Array.<string>} strings - The tagged template literals strings.
   * @param {*} value - The value.
   * @returns {string} A text.
   */
  value(strings, value) {
    // Try to serialize value.
    let serializedValue;
    try {
      serializedValue = JSON.stringify(value);
    } catch (error) {
      // Handle circular references and other stringification errors.
      return '';
    }

    if (serializedValue === undefined) {
      serializedValue = 'undefined';
    }

    const text = serializedValue.length > textMaxLength
      ? `${serializedValue.slice(0, textMaxLength)}...`
      : serializedValue;

    return `${strings[0] || ''}${text}${strings[1] || ''}`;
  }

  /**
   * Tagged template literals for a list of values.
   * @param {Array.<string>} strings - The tagged template literals strings.
   * @param {Array.<*>} values - The values.
   * @returns {string} A text.
   */
  values(strings, values) {
    if (!values) {
      return '';
    }

    const texts = values.reduce((list, value) => {
      const text = this.value`${value}`;
      list.push(text || '...');
      return list;
    }, []);

    return `${strings[0] || ''}[${texts.join(', ')}]${strings[1] || ''}`;
  }

  /**
   * Tagged template literals for a type.
   * @param {Array.<string>} strings - The tagged template literals strings.
   * @param {(string|Object|Array.<(string|Object)>)} type - The type(s).
   * @returns {string} A text.
   */
  type(strings, type) {
    const types = Array.isArray(type) ? type : [type];

    const texts = types.map((typeItem) => {
      let text;
      if (typeItem === Array) {
        text = 'an array';
      } else if (typeItem === Object) {
        text = 'an object';
      } else if (typeItem === Function) {
        text = 'a constructor function';
      } else if (typeItem === 'undefined' || typeItem === 'null') {
        text = typeItem;
      } else {
        const serializedType = typeof typeItem === 'function'
          ? `instance of ${(new (typeItem)()).constructor.name}` // eslint-disable-line new-cap
          : typeItem;
        if (/^(a\s|an\s|of\s|`)/.test(serializedType)) {
          text = serializedType;
        } else {
          text = vowels.includes(serializedType[0])
            ? `an ${serializedType}`
            : `a ${serializedType}`;
        }
      }
      return text;
    });

    return `${strings[0] || ''}${texts.join(' or ')}${strings[1] || ''}`;
  }

  /**
   * Attribute name.
   * @type {string}
   */
  get attribute() {
    return this[attribute];
  }

  /**
   * Attribute name.
   * @type {string}
   */
  set attribute(value) {
    this[attribute] = value;
    this[generateMessage]();
  }

  /**
   * Custom message.
   * @type {string}
   */
  get customMessage() {
    return this[customMessage];
  }

  /**
   * Custom message.
   * @type {string}
   */
  set customMessage(value) {
    this[customMessage] = value;
  }

  /**
   * Expected type.
   * @type {string|Function}
   */
  get expectedType() {
    return this[expectedType];
  }

  /**
   * Expected values.
   * @type {Array.<*>}
   */
  get expectedValues() {
    return this[expectedValues];
  }

  /**
   * Got type.
   * @type {*}
   */
  get gotType() {
    return this[gotType];
  }

  /**
   * Got value.
   * @type {*}
   */
  get gotValue() {
    return this[gotValue];
  }

  /**
   * Path.
   * @type {string}
   */
  set path(value) {
    this[path] = value;
    this[generateMessage]();
  }

  /**
   * Path.
   * @type {string}
   */
  get path() {
    return this[path];
  }

  /**
   * Subject.
   * @type {string}
   */
  get subject() {
    return this[subject];
  }

  /**
   * Generate the error message.
   * @returns {string}
   */
  [generateMessage]() {
    const messageParts = [];
    if (this[path]) {
      messageParts.push(this[attribute] ? `[${this[path]}](${this[attribute]})` : `[${this[path]}]`);
    }
    messageParts.push(`Expected ${this[subject]}`);
    messageParts.push(this.type`to be ${this[expectedType]}` + this.values` in ${this[expectedValues]}` + ','); // eslint-disable-line prefer-template
    if (this[gotType] === 'undefined' || this[gotType] === 'null') {
      messageParts.push(this.value`got \`${this[gotValue]}\``);
    } else {
      messageParts.push(this.type`got ${this[gotType]}`);
      messageParts.push(this.value`of value \`${this[gotValue]}\``);
    }
    messageParts.push('instead');

    this.message = messageParts.filter(part => part).join(' ');
  }
};
