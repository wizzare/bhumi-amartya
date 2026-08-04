import assert from "node:assert/strict";
import { sign, generateKeyPairSync } from "node:crypto";
import { generateEs256KeyPair } from "../../services/billing-verifier/scripts/generateKeys";
import { encryptToken, decryptToken } from "../../services/billing-verifier/lib/encryption";
import { generateSignedEntitlement, verifySignedEntitlement } from "../../services/billing-verifier/lib/signedEntitlement";
import { tokenHash } from "../../services/billing-verifier/lib/security";

let passed = 0;
async function test(label: string, work: () => void | Promise<void>) {
  try {
    await work();
    passed++;
    console.log(`PASS ${passed}: ${label}`);
  } catch (err: any) {
    console.error(`FAIL: ${label}`, err);
    throw err;
  }
}

function base64UrlToUint8Array(base64Url: string): Uint8Array {
  let base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
  while (base64.length % 4) {
    base64 += "=";
  }
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

function str2ab(str: string): ArrayBuffer {
  const buf = new ArrayBuffer(str.length);
  const bufView = new Uint8Array(buf);
  for (let i = 0, strLen = str.length; i < strLen; i++) {
    bufView[i] = str.charCodeAt(i);
  }
  return buf;
}

async function verifyWebCryptoSignature(
  token: string,
  publicKeyPem: string
): Promise<boolean> {
  const parts = token.split(".");
  if (parts.length !== 3) return false;

  const [headerBase64, payloadBase64, signatureBase64Url] = parts;

  // Extract raw base64 from PEM
  const b64Lines = publicKeyPem.split("\n").filter(line => !line.startsWith("-----") && line.trim().length > 0);
  const publicKeyBase64 = b64Lines.join("");
  const binaryDerString = atob(publicKeyBase64);
  const binaryDer = str2ab(binaryDerString);

  // Web Crypto verification using P-256 and SHA-256
  const key = await globalThis.crypto.subtle.importKey(
    "spki",
    binaryDer,
    { name: "ECDSA", namedCurve: "P-256" },
    false,
    ["verify"]
  );

  const signatureBytes = base64UrlToUint8Array(signatureBase64Url);
  const dataBytes = new TextEncoder().encode(`${headerBase64}.${payloadBase64}`);

  return await globalThis.crypto.subtle.verify(
    { name: "ECDSA", hash: { name: "SHA-256" } },
    key,
    signatureBytes,
    dataBytes
  );
}

async function run() {
  process.env.BILLING_TOKEN_ENCRYPTION_KEY_V1 = "0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef";

  const keys = generateEs256KeyPair();
  const rotatedKeys = generateEs256KeyPair();

  process.env.ENTITLEMENT_PRIVATE_KEY = keys.privateKey;
  process.env.NEXT_PUBLIC_ENTITLEMENT_PUBLIC_KEY = keys.publicKey;

  await test("hardened encryption and decryption with context AAD binding", () => {
    const rawToken = "google-play-raw-purchase-token-xyz-12345";
    const context = {
      uid: "user-abc-123",
      productId: "bhumi_premium_monthly",
      provider: "google_play",
    };

    const encrypted = encryptToken(rawToken, context);
    assert.ok(encrypted.ciphertext, "has ciphertext");
    assert.ok(encrypted.iv, "has iv");
    assert.ok(encrypted.tag, "has auth tag");
    assert.equal(encrypted.iv.length, 24, "IV is exactly 12 bytes hex (24 chars)");
    assert.equal(encrypted.tag.length, 32, "Tag is exactly 16 bytes hex (32 chars)");

    const decrypted = decryptToken(encrypted, context);
    assert.equal(decrypted, rawToken, "decrypted with same context matches original");
  });

  await test("decryption fails closed if context mismatch (mismatched AAD)", () => {
    const rawToken = "google-play-raw-purchase-token-xyz-12345";
    const context = {
      uid: "user-abc-123",
      productId: "bhumi_premium_monthly",
      provider: "google_play",
    };

    const encrypted = encryptToken(rawToken, context);

    assert.throws(
      () => decryptToken(encrypted, { ...context, uid: "different-user" }),
      /DECRYPTION_FAILED_OR_TAMPERED/
    );
    assert.throws(
      () => decryptToken(encrypted, { ...context, productId: "different-product" }),
      /DECRYPTION_FAILED_OR_TAMPERED/
    );
    assert.throws(
      () => decryptToken(encrypted, { ...context, provider: "apple_store" }),
      /DECRYPTION_FAILED_OR_TAMPERED/
    );
  });

  await test("valid ES256 asymmetric entitlement signature verification", () => {
    const claims = {
      sub: "user-abc-123",
      productId: "bhumi_premium_monthly",
      status: "ACTIVE",
      exp: Math.floor(Date.now() / 1000) + 3600,
      jti: "uuid-1",
      syncStatus: "ACTIVE_SYNCED",
    };

    const token = generateSignedEntitlement(claims);
    const verified = verifySignedEntitlement(token);

    assert.ok(verified, "verified successfully");
    assert.equal(verified?.sub, "user-abc-123");
    assert.equal(verified?.productId, "bhumi_premium_monthly");
  });

  await test("forged signature fails verification", () => {
    const claims = {
      sub: "user-abc-123",
      productId: "bhumi_premium_monthly",
      status: "ACTIVE",
      exp: Math.floor(Date.now() / 1000) + 3600,
      jti: "uuid-1",
      syncStatus: "ACTIVE_SYNCED",
    };

    const token = generateSignedEntitlement(claims);
    const parts = token.split(".");
    parts[2] = parts[2] + "X";
    const tampered = parts.join(".");

    const verified = verifySignedEntitlement(tampered);
    assert.equal(verified, null);
  });

  await test("mismatched UID fails verification", () => {
    const claims = {
      sub: "user-abc-123",
      productId: "bhumi_premium_monthly",
      status: "ACTIVE",
      exp: Math.floor(Date.now() / 1000) + 3600,
      jti: "uuid-1",
      syncStatus: "ACTIVE_SYNCED",
    };

    const token = generateSignedEntitlement(claims);
    const parts = token.split(".");

    const payload = JSON.parse(Buffer.from(parts[1], "base64url").toString("utf8"));
    payload.sub = "hacker-uid";
    parts[1] = Buffer.from(JSON.stringify(payload)).toString("base64url");
    const tampered = parts.join(".");

    const verified = verifySignedEntitlement(tampered);
    assert.equal(verified, null);
  });

  await test("expired token fails verification", () => {
    const claims = {
      sub: "user-abc-123",
      productId: "bhumi_premium_monthly",
      status: "ACTIVE",
      exp: Math.floor(Date.now() / 1000) - 1000,
      jti: "uuid-1",
      syncStatus: "ACTIVE_SYNCED",
    };

    const token = generateSignedEntitlement(claims);
    const verified = verifySignedEntitlement(token);
    assert.equal(verified, null);
  });

  await test("key rotation supports matching kid", () => {
    process.env.ENTITLEMENT_PRIVATE_KEY = rotatedKeys.privateKey;
    process.env.NEXT_PUBLIC_ENTITLEMENT_PUBLIC_KEY = rotatedKeys.publicKey;

    const claims = {
      sub: "user-abc-123",
      productId: "bhumi_premium_monthly",
      status: "ACTIVE",
      exp: Math.floor(Date.now() / 1000) + 3600,
      jti: "uuid-rotated",
      syncStatus: "ACTIVE_SYNCED",
    };

    const token = generateSignedEntitlement(claims, "v1");
    const verified = verifySignedEntitlement(token);
    assert.ok(verified);
    assert.equal(verified?.jti, "uuid-rotated");
  });

  // Cross-runtime Interoperability Test
  await test("Node crypto signer to Web Crypto verification interoperability", async () => {
    process.env.ENTITLEMENT_PRIVATE_KEY = keys.privateKey;
    process.env.NEXT_PUBLIC_ENTITLEMENT_PUBLIC_KEY = keys.publicKey;

    const claims = {
      sub: "user-abc-123",
      productId: "bhumi_premium_monthly",
      status: "ACTIVE",
      exp: Math.floor(Date.now() / 1000) + 3600,
      jti: "uuid-webcrypto-1",
      syncStatus: "ACTIVE_SYNCED",
    };

    const token = generateSignedEntitlement(claims);

    // Verify token using Web Crypto API directly (same code as mobile client)
    const verifiedByWebCrypto = await verifyWebCryptoSignature(token, keys.publicKey);
    assert.equal(verifiedByWebCrypto, true, "Web Crypto verifies Node ieee-p1363 raw signature successfully");
  });

  await test("DER-encoded signatures are rejected by the Web Crypto verifier", async () => {
    // Generate a DER-encoded signature using Node sign without ieee-p1363
    const header = { alg: "ES256", typ: "JWT", kid: "v1" };
    const claims = {
      sub: "user-abc-123",
      productId: "bhumi_premium_monthly",
      status: "ACTIVE",
      exp: Math.floor(Date.now() / 1000) + 3600,
      jti: "uuid-der",
      syncStatus: "ACTIVE_SYNCED",
    };

    const headerBase64 = Buffer.from(JSON.stringify(header)).toString("base64url");
    const payloadBase64 = Buffer.from(JSON.stringify(claims)).toString("base64url");
    const signatureData = `${headerBase64}.${payloadBase64}`;

    // Node default ECDSA signing is DER encoding
    const derSignature = sign("sha256", Buffer.from(signatureData), {
      key: keys.privateKey,
    });

    const derToken = `${signatureData}.${derSignature.toString("base64url")}`;

    // Verify DER token using Node verifier (which accepts DER)
    const verifiedByNode = verifySignedEntitlement(derToken);
    assert.equal(verifiedByNode, null, "verifier rejects DER encoding because it explicitly enforces ieee-p1363");

    // Verify DER token using Web Crypto verifier (which will fail because size is not 64-bytes raw)
    const verifiedByWebCrypto = await verifyWebCryptoSignature(derToken, keys.publicKey);
    assert.equal(verifiedByWebCrypto, false, "Web Crypto rejects DER-encoded signature");
  });

  console.log(`BUILD84_PURCHASE_LEDGER_PASS tests=${passed}`);
}

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
