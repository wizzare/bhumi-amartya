import { sign, verify, createPrivateKey, createPublicKey } from "node:crypto";

export interface EntitlementClaims {
  iss: string;
  aud: string;
  sub: string;
  productId: string;
  status: string;
  iat: number;
  exp: number;
  jti: string;
  syncStatus: string;
  tokenVersion: string;
}

export interface TokenHeader {
  alg: string;
  typ: string;
  kid: string;
}

function getPrivateKeyPem(): string {
  const pem = process.env.ENTITLEMENT_PRIVATE_KEY;
  if (!pem) {
    throw new Error("ENTITLEMENT_PRIVATE_KEY is not configured.");
  }
  return pem.trim().replace(/\\n/g, "\n");
}

function getPublicKeyPem(kid: string): string {
  // Support key rotation by mapping kid to different public keys
  if (kid === "v1") {
    const pem = process.env.NEXT_PUBLIC_ENTITLEMENT_PUBLIC_KEY || process.env.ENTITLEMENT_PUBLIC_KEY;
    if (!pem) {
      throw new Error("ENTITLEMENT_PUBLIC_KEY for v1 is not configured.");
    }
    return pem.trim().replace(/\\n/g, "\n");
  }
  throw new Error(`UNKNOWN_KID: ${kid}`);
}

export function generateSignedEntitlement(
  claims: Omit<EntitlementClaims, "iss" | "aud" | "iat" | "tokenVersion">,
  kid = "v1"
): string {
  const privateKeyPem = getPrivateKeyPem();
  const privateKey = createPrivateKey(privateKeyPem);

  const header: TokenHeader = {
    alg: "ES256",
    typ: "JWT",
    kid,
  };

  const fullClaims: EntitlementClaims = {
    ...claims,
    iss: "bhumi-auth-verifier",
    aud: "bhumi-mobile-app",
    iat: Math.floor(Date.now() / 1000),
    tokenVersion: "1.0",
  };

  const headerBase64 = Buffer.from(JSON.stringify(header)).toString("base64url");
  const payloadBase64 = Buffer.from(JSON.stringify(fullClaims)).toString("base64url");
  const signatureData = `${headerBase64}.${payloadBase64}`;

  // Sign using ECDSA (ES256 expects P-256 curve ECDSA signature in IEEE P1363 dsaEncoding format)
  // crypto.sign automatically supports dsaEncoding: "ieee-p1363" or DER. Let's use DER, but standard JWT uses IEEE-P1363.
  // Actually, Web Crypto API expects raw signature (which is IEEE P1363 signature, size 64 bytes).
  // Node sign defaults to DER. We must specify dsaEncoding: "ieee-p1363" to match Web Crypto signature expectations!
  const signatureBuffer = sign("sha256", Buffer.from(signatureData), {
    key: privateKey,
    dsaEncoding: "ieee-p1363",
  });

  const signatureBase64Url = signatureBuffer.toString("base64url");
  return `${signatureData}.${signatureBase64Url}`;
}

export function verifySignedEntitlement(token: string): EntitlementClaims | null {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;

    const [headerBase64, payloadBase64, signatureBase64Url] = parts;
    const header = JSON.parse(Buffer.from(headerBase64, "base64url").toString("utf8")) as TokenHeader;

    if (header.alg !== "ES256" || header.typ !== "JWT") return null;

    const publicKeyPem = getPublicKeyPem(header.kid);
    const publicKey = createPublicKey(publicKeyPem);

    const signatureData = `${headerBase64}.${payloadBase64}`;
    const signatureBuffer = Buffer.from(signatureBase64Url, "base64url");

    const verified = verify("sha256", Buffer.from(signatureData), {
      key: publicKey,
      dsaEncoding: "ieee-p1363",
    }, signatureBuffer);

    if (!verified) return null;

    const claims = JSON.parse(Buffer.from(payloadBase64, "base64url").toString("utf8")) as EntitlementClaims;

    // Validation checks
    const now = Math.floor(Date.now() / 1000);
    const clockSkew = 60; // 60 seconds clock skew threshold

    if (claims.iss !== "bhumi-auth-verifier" || claims.aud !== "bhumi-mobile-app") return null;
    if (claims.iat > now + clockSkew) return null;
    if (claims.exp <= now - clockSkew) return null;
    if (claims.status !== "ACTIVE" && claims.status !== "ACTIVE_PENDING_SYNC" && claims.status !== "ACTIVE_SYNCED") return null;
    if (claims.tokenVersion !== "1.0") return null;

    return claims;
  } catch {
    return null;
  }
}
