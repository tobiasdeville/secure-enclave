// errors/secureEnclaveError.js
const BaseError = require('./baseError');

class SecureEnclaveError extends BaseError {
  constructor(description, statusCode = 500) {
    super('SecureEnclaveError', statusCode, true, description);
  }
}

module.exports = SecureEnclaveError;
