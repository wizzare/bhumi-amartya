import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { getPlayReportsAccessToken, clearPlayAuthTokenCache } from "../../lib/google/playAuth";
import { classifyHttpStatus, getPackageName } from "../../lib/google/playReporting";
import { getBucketName } from "../../lib/google/playGcs";

describe("Dedicated Google Play Connector - Unit Tests", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = { ...originalEnv };
    clearPlayAuthTokenCache();
  });

  afterEach(() => {
    process.env = originalEnv;
    clearPlayAuthTokenCache();
  });

  it("should return CONFIG_REQUIRED when credentials are missing", async () => {
    delete process.env.PLAY_REPORTS_CLIENT_EMAIL;
    delete process.env.PLAY_REPORTS_PRIVATE_KEY;

    const result = await getPlayReportsAccessToken();
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.code).toBe("CONFIG_REQUIRED");
    }
  });

  it("should return default package name and bucket name", () => {
    expect(getPackageName()).toBe("com.bhumiamartya.app");
    expect(getBucketName()).toBe("pubsite_prod_4753825950500775050");
  });

  it("should correctly classify HTTP status codes", () => {
    expect(classifyHttpStatus(401, "Test").code).toBe("AUTH_ERROR");
    expect(classifyHttpStatus(403, "Test").code).toBe("PERMISSION_DENIED");
    expect(classifyHttpStatus(404, "Test").code).toBe("NOT_FOUND");
    expect(classifyHttpStatus(429, "Test").code).toBe("RATE_LIMITED");
    expect(classifyHttpStatus(500, "Test").code).toBe("UPSTREAM_ERROR");
  });

  it("should NOT use Firebase Admin or Billing credentials as fallback", async () => {
    delete process.env.PLAY_REPORTS_CLIENT_EMAIL;
    delete process.env.PLAY_REPORTS_PRIVATE_KEY;

    process.env.FIREBASE_CLIENT_EMAIL = "firebase-admin@test.com";
    process.env.FIREBASE_PRIVATE_KEY = "dummy-firebase-key";
    process.env.GOOGLE_PLAY_CLIENT_EMAIL = "billing-admin@test.com";
    process.env.GOOGLE_PLAY_PRIVATE_KEY = "dummy-billing-key";

    const result = await getPlayReportsAccessToken();
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.code).toBe("CONFIG_REQUIRED");
    }
  });
});
