const DEFAULT_TIMEOUT_MS = 5_000;

function reject(code) {
  throw Object.assign(new Error(code), { code });
}

export function createIdentityToolkitRevocationChecker({
  fetchImpl = globalThis.fetch,
  lookupUrl,
  apiKey,
  timeoutMs = DEFAULT_TIMEOUT_MS,
} = {}) {
  if (typeof lookupUrl !== "string" || !lookupUrl) reject("QA_REVOCATION_CONFIG_INVALID");
  if (typeof apiKey !== "string" || !apiKey) reject("QA_REVOCATION_CONFIG_INVALID");
  if (typeof fetchImpl !== "function") reject("QA_REVOCATION_FETCH_UNAVAILABLE");

  return async function checkRevocation(token, decoded) {
    if (typeof token !== "string" || !token) reject("TOKEN_REVOCATION_INVALID");
    const authTime = decoded?.claims?.auth_time;
    if (typeof authTime !== "number" || !Number.isFinite(authTime) || authTime < 0) {
      reject("TOKEN_AUTH_TIME");
    }

    let response;
    try {
      response = await fetchImpl(`${lookupUrl}?key=${encodeURIComponent(apiKey)}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idToken: token }),
        signal: AbortSignal.timeout(timeoutMs),
      });
    } catch {
      reject("TOKEN_REVOCATION_UNAVAILABLE");
    }
    if (!response?.ok) reject("TOKEN_REVOCATION_UNAVAILABLE");

    let body;
    try {
      body = await response.json();
    } catch {
      reject("TOKEN_REVOCATION_INVALID");
    }
    if (!body || !Array.isArray(body.users) || body.users.length !== 1) {
      reject("TOKEN_REVOCATION_INVALID");
    }
    const user = body.users[0];
    if (!user || typeof user.localId !== "string" || user.localId !== decoded.uid) {
      reject("TOKEN_REVOCATION_SUBJECT_MISMATCH");
    }
    if (user.disabled === true) reject("TOKEN_USER_DISABLED");
    let validSince = 0;
    if (user.validSince !== undefined && user.validSince !== null && user.validSince !== "") {
      validSince = Number(user.validSince);
      if (!Number.isFinite(validSince) || validSince < 0) reject("TOKEN_REVOCATION_INVALID");
    }
    if (authTime < validSince) reject("TOKEN_REVOKED");

    return true;
  };
}
