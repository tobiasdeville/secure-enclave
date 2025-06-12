// secureEnclaveService.js
const NodeSecureEnclave = require("node-secure-enclave");
const SecureEnclaveError = require("./errors/secureEnclaveError");
const { centralizedErrorHandler } = require("./errorHandler");

const keyTag = "com.example.app.productionkey";

async function setupKey() {
  try {
    if (!NodeSecureEnclave.isSupported) {
      throw new SecureEnclaveError(
        "Secure Enclave is not supported on this device."
      );
    }

    let keyPair = await NodeSecureEnclave.findKeyPair({ keyTag });
    if (!keyPair) {
      keyPair = await NodeSecureEnclave.createKeyPair({ keyTag });
    }
    return keyPair;
  } catch (error) {
    centralizedErrorHandler(error);
    throw error;
  }
}

async function encryptData(plainText) {
  try {
    const dataBuffer = Buffer.from(plainText, "utf8");
    const encrypted = await NodeSecureEnclave.encrypt({
      keyTag,
      data: dataBuffer,
    });
    return encrypted.toString("base64");
  } catch (error) {
    centralizedErrorHandler(error);
    throw new SecureEnclaveError("Encryption failed.");
  }
}

async function decryptData(encryptedBase64) {
  try {
    const encryptedBuffer = Buffer.from(encryptedBase64, "base64");
    const decryptedBuffer = await NodeSecureEnclave.decrypt({
      keyTag,
      data: encryptedBuffer,
      touchIdPrompt: "Authenticate to decrypt sensitive data",
    });
    return decryptedBuffer.toString("utf8");
  } catch (error) {
    if (error.rejected) {
      centralizedErrorHandler(
        new SecureEnclaveError("User rejected Touch ID authentication.", 401)
      );
    } else if (error.keyNotFound) {
      centralizedErrorHandler(
        new SecureEnclaveError("Key not found in Secure Enclave.", 404)
      );
    } else {
      centralizedErrorHandler(new SecureEnclaveError("Decryption failed."));
    }
    throw error;
  }
}

module.exports = { setupKey, encryptData, decryptData };
