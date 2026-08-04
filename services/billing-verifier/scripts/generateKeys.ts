import { generateKeyPairSync } from "node:crypto";

export function generateEs256KeyPair() {
  const { privateKey, publicKey } = generateKeyPairSync("ec", {
    namedCurve: "P-256",
    publicKeyEncoding: {
      type: "spki",
      format: "pem",
    },
    privateKeyEncoding: {
      type: "pkcs8",
      format: "pem",
    },
  });

  return { privateKey, publicKey };
}

if (require.main === module) {
  const { privateKey, publicKey } = generateEs256KeyPair();
  console.log("--- ENTITLEMENT_PRIVATE_KEY ---");
  console.log(privateKey);
  console.log("--- ENTITLEMENT_PUBLIC_KEY ---");
  console.log(publicKey);
}
