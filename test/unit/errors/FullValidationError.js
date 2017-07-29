'use strict';

const expect = require('../../expect');
const FullValidationError = require('../../../src/errors/FullValidationError');

const error = new FullValidationError();

describe('FullValidationError', () => {
  describe('"errors" getter', () => {
    it('should return an error list', () => {
      expect(error.errors).to.deep.equal([]);
    });
  });

  describe('"pathErrors" getter', () => {
    it('should return an object with errors indexed by path', () => {
      expect(error.pathErrors).to.deep.equal({});
    });
  });

  describe('"errorMessages" getter', () => {
    it('should return an error message list', () => {
      expect(error.errors).to.deep.equal([]);
    });
  });

  describe('"pathErrorMessages" getter', () => {
    it('should return an object with error messages indexed by path', () => {
      expect(error.pathErrors).to.deep.equal({});
    });
  });

  describe('"setPathError" getter', () => {
    it('should set an error for a path', () => {
      const fooError = new Error('foo');
      fooError.customMessage = 'errored';
      const barError = new Error('bar');
      error.setPathError('$.foo', fooError);
      error.setPathError('$.bar', barError);
      expect(error.errors).to.deep.equal([fooError, barError]);
      expect(error.pathErrors).to.deep.equal({'$.foo': fooError, '$.bar': barError});
      expect(error.errorMessages).to.deep.equal(['bar', 'errored']);
      expect(error.pathErrorMessages).to.deep.equal({'$.foo': 'errored', '$.bar': 'bar'});
    });
  });
});
