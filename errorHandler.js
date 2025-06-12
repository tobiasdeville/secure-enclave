// errorHandler.js
const SecureEnclaveError = require("./errors/secureEnclaveError");

function logError(error) {
  // Integrate with logging service here (e.g., Sentry)
  console.error(
    `[${new Date().toISOString()}] ${error.name}: ${error.message}`
  );
}

function isOperationalError(error) {
  return error.isOperational === true;
}

function centralizedErrorHandler(error) {
  logError(error);
  if (!isOperationalError(error)) {
    // For programmer errors, optionally exit or alert
    process.exit(1);
  }
}

module.exports = { logError, centralizedErrorHandler, isOperationalError };
