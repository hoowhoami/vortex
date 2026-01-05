import SimpleCrypto from "simple-crypto-js";

export { SimpleCrypto };

export function encryptData(data: string, password: string): string {
  const crypto = new SimpleCrypto(password);
  return crypto.encrypt(data);
}

export function decryptData(encrypted: string, password: string): string {
  try {
    const crypto = new SimpleCrypto(password);
    return crypto.decrypt(encrypted) as string;
  } catch (error) {
    throw new Error("Decryption failed - incorrect password or corrupted data");
  }
}
