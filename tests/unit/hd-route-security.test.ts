import assert from "node:assert";
import Module from "node:module";

// Install safe Firebase Admin mock before importing the route so getOrCreateHdAdminApp() uses it safely
const mockAdminApp = { name: "bhumi-hd-admin", options: { projectId: "demo-qa" } };
const mockAuth = {
  verifyIdToken: async (token: string) => {
    if (token === "valid_id_token_12345") {
      return { uid: "test-user-123", email: "test@example.com" };
    }
    if (token === "expired_id_token") {
      throw new Error("auth/id-token-expired");
    }
    if (token === "wrong_project_token") {
      throw new Error("auth/argument-error: Firebase ID token has incorrect audience");
    }
    if (token === "malformed_token") {
      throw new Error("auth/argument-error: Decoding Firebase ID token failed");
    }
    throw new Error("auth/invalid-id-token");
  },
};

let simulateInitFail = false;
const originalLoad = (Module as any)._load;
(Module as any)._load = function (request: string, parent: any, isMain: boolean, options: any) {
  if (request === "firebase-admin/app") {
    return {
      initializeApp: () => {
        if (simulateInitFail) throw new Error("Firebase Admin init failed");
        return mockAdminApp;
      },
      getApps: () => (simulateInitFail ? [] : [mockAdminApp]),
      cert: () => ({}),
    };
  }
  if (request === "firebase-admin/auth") {
    return {
      getAuth: () => mockAuth,
    };
  }
  return originalLoad.call(this, request, parent, isMain, options);
};

console.log("▶ Running Human Design API Route Security Unit Tests\n");

let passed = 0;
let failed = 0;

function test(label: string, condition: boolean, detail?: string) {
  if (condition) {
    passed++;
    console.log(`  PASS: ${label}`);
  } else {
    failed++;
    console.error(`  FAIL: ${label}${detail ? " — " + detail : ""}`);
  }
}

async function runTests() {
  const { POST, OPTIONS } = await import("../../app/api/humandesign/calculate/route");
  const envBackup = process.env.NODE_ENV;
  try {
    (process.env as any).NODE_ENV = "production";

    // 1. Tanpa Token -> 401 Unauthorized
    {
      const req = new Request("http://localhost:3000/api/humandesign/calculate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ birthDate: "1985-05-03", birthTime: "23:45", birthPlace: "Jakarta", timezone: "+07:00" }),
      });
      const res = await POST(req);
      test("Tanpa Token returns HTTP 401 Unauthorized", res.status === 401);
      const data = await res.json();
      test("Tanpa Token status note is unauthorized", data.status === "error" && data.calculationStatus === "unauthorized");
    }

    // 2. Token Invalid -> 403 Forbidden
    {
      const req = new Request("http://localhost:3000/api/humandesign/calculate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": "Bearer invalid_id_token_12345",
        },
        body: JSON.stringify({ birthDate: "1985-05-03", birthTime: "23:45", birthPlace: "Jakarta", timezone: "+07:00" }),
      });
      const res = await POST(req);
      test("Token Invalid returns HTTP 403 Forbidden", res.status === 403);
    }

    // 2b. Expired Token -> 403 Forbidden
    {
      const req = new Request("http://localhost:3000/api/humandesign/calculate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": "Bearer expired_id_token",
        },
        body: JSON.stringify({ birthDate: "1985-05-03", birthTime: "23:45", birthPlace: "Jakarta", timezone: "+07:00" }),
      });
      const res = await POST(req);
      test("Expired Token returns HTTP 403 Forbidden", res.status === 403);
    }

    // 2c. Wrong Project Token -> 403 Forbidden
    {
      const req = new Request("http://localhost:3000/api/humandesign/calculate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": "Bearer wrong_project_token",
        },
        body: JSON.stringify({ birthDate: "1985-05-03", birthTime: "23:45", birthPlace: "Jakarta", timezone: "+07:00" }),
      });
      const res = await POST(req);
      test("Wrong Project Token returns HTTP 403 Forbidden", res.status === 403);
    }

    // 2d. Malformed Authorization Header -> 401 Unauthorized
    {
      const req = new Request("http://localhost:3000/api/humandesign/calculate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": "Bearer ",
        },
        body: JSON.stringify({ birthDate: "1985-05-03", birthTime: "23:45", birthPlace: "Jakarta", timezone: "+07:00" }),
      });
      const res = await POST(req);
      test("Malformed Authorization header returns HTTP 401", res.status === 401);
    }

    // 2e. AppCheck-only token without Auth Bearer in production -> 401 Unauthorized
    {
      const req = new Request("http://localhost:3000/api/humandesign/calculate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Firebase-AppCheck": "sample-appcheck-token",
        },
        body: JSON.stringify({ birthDate: "1985-05-03", birthTime: "23:45", birthPlace: "Jakarta", timezone: "+07:00" }),
      });
      const res = await POST(req);
      test("AppCheck-only without user auth returns HTTP 401", res.status === 401);
    }

    // 2f. Production Dev-Bypass attempt rejected -> 401 Unauthorized (never bypassed in production)
    {
      const req = new Request("http://localhost:3000/api/humandesign/calculate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-dev-secret": "bhumi-dev-bypass",
        },
        body: JSON.stringify({ birthDate: "1985-05-03", birthTime: "23:45", birthPlace: "Jakarta", timezone: "+07:00" }),
      });
      const res = await POST(req);
      test("Production dev-bypass attempt rejected with HTTP 401", res.status === 401);
    }

    // 3. Authenticated Valid Token -> 200 OK
    {
      const canonicalFixture = {
        status: "ready",
        type: "Projector",
        strategy: "Wait for the Invitation",
        authority: "Splenic",
        profile: "2/4",
        definition: "Single Definition",
        inc_cross: "Right Angle Cross of the Sphinx",
        definedCenters: ["Spleen", "G Center"],
        openCenters: ["Head", "Ajna", "Throat", "Heart", "Sacral", "Solar Plexus", "Root"],
        channels: ["10-57"],
        gatesPersonality: [10, 57],
        gatesDesign: [10, 57],
      };
      const originalFetch = globalThis.fetch;
      globalThis.fetch = async () => new Response(JSON.stringify(canonicalFixture), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });

      const req = new Request("http://localhost:3000/api/humandesign/calculate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": "Bearer valid_id_token_12345",
        },
        body: JSON.stringify({ birthDate: "1985-05-03", birthTime: "23:45", birthPlace: "Jakarta", timezone: "+07:00" }),
      });
      const res = await POST(req);
      test("Valid Token returns HTTP 200 OK", res.status === 200);
      const data = await res.json();
      test("Response contains canonical quality metadata", data.calculationQuality === "verified");

      globalThis.fetch = originalFetch;
    }

    // 3b. Live advanced fields are passed through without route-level loss.
    {
      const advancedFixture = {
        status: "ready",
        type: "Projector",
        strategy: "Wait for the Invitation",
        authority: "Splenic",
        profile: "2/4",
        definition: "Single Definition",
        inc_cross: "Right Angle Cross of the Sphinx",
        definedCenters: ["Spleen", "G Center"],
        openCenters: ["Head", "Ajna", "Throat", "Heart", "Sacral", "Solar Plexus", "Root"],
        channels: ["10-57"],
        gatesPersonality: [10, 57],
        gatesDesign: [10, 57],
        digestion: "Active",
        environment: "Observer",
        motivation: "Receptive",
        cognition: "Outer Vision",
        variables: { short_code: "PRR DLR" },
      };
      const originalFetch = globalThis.fetch;
      globalThis.fetch = async () => new Response(JSON.stringify(advancedFixture), { status: 200, headers: { "Content-Type": "application/json" } });

      const req = new Request("http://localhost:3000/api/humandesign/calculate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": "Bearer valid_id_token_12345",
        },
        body: JSON.stringify({ birthDate: "1985-05-03", birthTime: "23:45", birthPlace: "Jakarta", timezone: "+07:00" }),
      });
      const res = await POST(req);
      const data = await res.json();
      test("Route preserves live advanced fields", data.digestion === "Active" && data.environment === "Observer" && data.motivation === "Receptive" && data.cognition === "Outer Vision" && data.variables?.short_code === "PRR DLR");
      globalThis.fetch = originalFetch;
    }

    // 4. Payload Invalid -> 400 Bad Request
    {
      const req = new Request("http://localhost:3000/api/humandesign/calculate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": "Bearer valid_id_token_12345",
        },
        body: JSON.stringify({ birthDate: "invalid-date", birthTime: "23:45" }),
      });
      const res = await POST(req);
      test("Payload Invalid returns HTTP 400 Bad Request", res.status === 400);
    }

    // 5. Missing Timezone -> 400 needs_verified_timezone
    {
      const req = new Request("http://localhost:3000/api/humandesign/calculate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": "Bearer valid_id_token_12345",
        },
        body: JSON.stringify({ birthDate: "1985-05-03", birthTime: "23:45", birthPlace: "Jakarta" }),
      });
      const res = await POST(req);
      test("Missing Timezone returns HTTP 400", res.status === 400);
      const data = await res.json();
      test("Missing Timezone returns needs_verified_timezone", data.calculationStatus === "needs_verified_timezone");
    }

    // 6. Upstream Timeout -> 503 Service Unavailable
    {
      const originalFetch = globalThis.fetch;
      globalThis.fetch = async (_url: any, options: any) => {
        const err = new DOMException("The operation was aborted.", "AbortError");
        throw err;
      };

      const req = new Request("http://localhost:3000/api/humandesign/calculate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": "Bearer valid_id_token_12345",
        },
        body: JSON.stringify({ birthDate: "1985-05-03", birthTime: "23:45", birthPlace: "Jakarta", timezone: "+07:00" }),
      });
      const res = await POST(req);
      test("Upstream Timeout returns HTTP 503 Service Unavailable", res.status === 503);

      globalThis.fetch = originalFetch;
    }

    // 7. Rate Limit -> 429 Too Many Requests
    {
      const originalFetch = globalThis.fetch;
      globalThis.fetch = async () => new Response("{}", {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });

      let lastRes: Response | null = null;
      for (let i = 0; i < 25; i++) {
        const req = new Request("http://localhost:3000/api/humandesign/calculate", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-forwarded-for": "192.168.1.99",
            "Authorization": "Bearer valid_id_token_12345",
          },
          body: JSON.stringify({ birthDate: "1985-05-03", birthTime: "23:45", birthPlace: "Jakarta", timezone: "+07:00" }),
        });
        lastRes = await POST(req);
      }
      test("Excessive Requests (25x) triggers HTTP 429 Rate Limit", lastRes?.status === 429);

      globalThis.fetch = originalFetch;
    }

    // 8. CORS OPTIONS preflight behavior
    {
      const req = new Request("http://localhost:3000/api/humandesign/calculate", {
        method: "OPTIONS",
        headers: {
          "Origin": "https://localhost",
          "Access-Control-Request-Method": "POST",
        },
      });
      const res = await OPTIONS(req);
      test("CORS OPTIONS preflight allowed origin returns 204", res.status === 204);
      test("CORS headers present on preflight", res.headers.get("Access-Control-Allow-Methods")?.includes("POST") === true);

      const unallowedReq = new Request("http://localhost:3000/api/humandesign/calculate", {
        method: "OPTIONS",
        headers: {
          "Origin": "https://malicious-site.com",
        },
      });
      const unallowedRes = await OPTIONS(unallowedReq);
      test("CORS OPTIONS unallowed origin returns 403", unallowedRes.status === 403);
    }

    // 9. Firebase Admin Init Failure -> 500
    {
      simulateInitFail = true;
      const req = new Request("http://localhost:3000/api/humandesign/calculate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": "Bearer valid_id_token_12345",
        },
        body: JSON.stringify({ birthDate: "1985-05-03", birthTime: "23:45", birthPlace: "Jakarta", timezone: "+07:00" }),
      });
      const res = await POST(req);
      test("Firebase Admin initialization failure returns HTTP 500", res.status === 500);
      simulateInitFail = false;
    }

  } finally {
    (process.env as any).NODE_ENV = envBackup;
  }

  console.log(`\nResults: ${passed + failed} tests, ${passed} passed, ${failed} failed`);
  if (failed > 0) process.exit(1);
}

runTests().catch(console.error);
