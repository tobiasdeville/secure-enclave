// __tests__/secureEnclaveService.test.js
const {
  setupKey,
  encryptData,
  decryptData,
} = require("../secureEnclaveService");
const NodeSecureEnclave = require("node-secure-enclave");

jest.mock("node-secure-enclave");

describe("Secure Enclave Service", () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  test("setupKey creates new key if none exists", async () => {
    NodeSecureEnclave.isSupported = true;
    NodeSecureEnclave.findKeyPair.mockResolvedValue(null);
    NodeSecureEnclave.createKeyPair.mockResolvedValue({
      publicKey: Buffer.from("publicKey"),
    });

    const keyPair = await setupKey();
    expect(NodeSecureEnclave.createKeyPair).toHaveBeenCalledWith({
      keyTag: "com.example.app.productionkey",
    });
    expect(keyPair.publicKey.toString()).toBe("publicKey");
  });

  test("setupKey returns existing key if found", async () => {
    NodeSecureEnclave.isSupported = true;
    NodeSecureEnclave.findKeyPair.mockResolvedValue({
      publicKey: Buffer.from("existingKey"),
    });

    const keyPair = await setupKey();
    expect(NodeSecureEnclave.createKeyPair).not.toHaveBeenCalled();
    expect(keyPair.publicKey.toString()).toBe("existingKey");
  });

  test("encryptData returns base64 encrypted string", async () => {
    const fakeEncryptedBuffer = Buffer.from("encryptedData");
    NodeSecureEnclave.encrypt.mockResolvedValue(fakeEncryptedBuffer);

    const encrypted = await encryptData("my secret");
    expect(encrypted).toBe(fakeEncryptedBuffer.toString("base64"));
  });

  test("decryptData returns decrypted string", async () => {
    const decryptedBuffer = Buffer.from("decryptedData");
    NodeSecureEnclave.decrypt.mockResolvedValue(decryptedBuffer);

    const decrypted = await decryptData(
      Buffer.from("encryptedData").toString("base64")
    );
    expect(decrypted).toBe("decryptedData");
  });

  test("decryptData throws on user rejection", async () => {
    const error = new Error("User rejected");
    error.rejected = true;
    NodeSecureEnclave.decrypt.mockRejectedValue(error);

    await expect(decryptData("invalid")).rejects.toThrow("User rejected");
  });
});
