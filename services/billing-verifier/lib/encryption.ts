import { createCipheriv, createDecipheriv, randomBytes } from "node:crypto";

const ALGORITHM = "aes-256-gcm";
const IV_LENGTH = 12;

export interface EncryptedData {
  ciphertext: string;
  iv: string;
  tag: string;
  version: string;
}

export interface EncryptionContext {
  uid: string;
  productId: string;
  provider: string;
}

function getEncryptionKey(): Buffer {
  const hexKey = process.env.BILLING_TOKEN_ENCRYPTION_KEY_V1;
  if (!hexKey) {
    if (process.env.NODE_ENV === "test") {
      // Deterministic test key ONLY for test fixtures
      return Buffer.from("0000000000000000000000000000000000000000000000000000000000000000", "hex");
    }
    throw new Error("BILLING_TOKEN_ENCRYPTION_KEY_V1 is not configured.");
  }

  const key = Buffer.from(hexKey, "hex");
  if (key.length !== 32) {
    throw new Error("BILLING_TOKEN_ENCRYPTION_KEY_V1 must be exactly 32 bytes (64 hex characters).");
  }
  return key;
}

function buildAAD(context: EncryptionContext): Buffer {
  return Buffer.from(`${context.uid}:${context.productId}:${context.provider}`, "utf8");
}

export function encryptToken(token: string, context: EncryptionContext): EncryptedData {
  const key = getEncryptionKey();
  const iv = randomBytes(IV_LENGTH);
  const cipher = createCipheriv(ALGORITHM, key, iv);

  cipher.setAAD(buildAAD(context));

  let ciphertext = cipher.update(token, "utf8", "hex");
  ciphertext += cipher.final("hex");

  const tag = cipher.getAuthTag().toString("hex");

  return {
    ciphertext,
    iv: iv.toString("hex"),
    tag,
    version: "v1"
  };
}

export function decryptToken(encryptedData: EncryptedData, context: EncryptionContext): string {
  if (encryptedData.version !== "v1") {
    throw new Error(`UNSUPPORTED_KEY_VERSION: ${encryptedData.version}`);
  }

  const key = getEncryptionKey();
  const iv = Buffer.from(encryptedData.iv, "hex");
  const tag = Buffer.from(encryptedData.tag, "hex");

  const decipher = createDecipheriv(ALGORITHM, key, iv);
  decipher.setAAD(buildAAD(context));
  decipher.setAuthTag(tag);

  try {
    let decrypted = decipher.update(encryptedData.ciphertext, "hex", "utf8");
    decrypted += decipher.final("utf8");
    return decrypted;
  } catch (err: any) {
    throw Object.assign(new Error("DECRYPTION_FAILED_OR_TAMPERED"), {
      cause: err,
      code: "DECRYPTION_FAILED"
    });
  }
}
