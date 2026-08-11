import assert from "node:assert";
import { POST } from "../../app/api/humandesign/calculate/route";

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
  const envBackup = process.env.NODE_ENV;
  try {
    // Enable production mode for strict security tests
    (process.env as any).NODE_ENV = "production";

    // 1. Tanpa Token -> 401 Unauthorized
    {
      const req = new Request("http://localhost:3000/api/humandesign/calculate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ birthDate: "1985-05-03", birthTime: "23:45", birthPlace: "Jakarta" }),
      });
      const res = await POST(req);
      test("Tanpa Token returns HTTP 401 Unauthorized", res.status === 401);
      const data = await res.json();
      test("Tanpa Token status note is unauthorized", data.status === "error");
    }

    // 2. Token Invalid -> 403 Forbidden
    {
      const req = new Request("http://localhost:3000/api/humandesign/calculate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": "Bearer invalid_id_token_12345",
        },
        body: JSON.stringify({ birthDate: "1985-05-03", birthTime: "23:45", birthPlace: "Jakarta" }),
      });
      const res = await POST(req);
      test("Token Invalid returns HTTP 403 Forbidden", res.status === 403);
    }

    // 3. Token Valid / Dev Bypass -> 200 OK
    {
      const originalFetch = globalThis.fetch;
      globalThis.fetch = async () => new Response(JSON.stringify({ type: "Projector", profile: "2/4" }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });

      const req = new Request("http://localhost:3000/api/humandesign/calculate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-dev-secret": "bhumi-dev-bypass",
        },
        body: JSON.stringify({ birthDate: "1985-05-03", birthTime: "23:45", birthPlace: "Jakarta", timezone: "+07:00" }),
      });
      const res = await POST(req);
      test("Dev Bypass / Valid Token returns HTTP 200 OK", res.status === 200);
      const data = await res.json();
      test("Response contains canonical quality metadata", data.calculationQuality === "verified");

      globalThis.fetch = originalFetch;
    }

    // 4. Payload Invalid -> 400 Bad Request
    {
      const req = new Request("http://localhost:3000/api/humandesign/calculate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-dev-secret": "bhumi-dev-bypass",
        },
        body: JSON.stringify({ birthDate: "invalid-date", birthTime: "23:45" }),
      });
      const res = await POST(req);
      test("Payload Invalid returns HTTP 400 Bad Request", res.status === 400);
    }

    // 5. Upstream Timeout -> 503 Service Unavailable
    {
      // Mock fetch with aborted signal simulation
      const originalFetch = globalThis.fetch;
      globalThis.fetch = async (_url: any, options: any) => {
        const err = new DOMException("The operation was aborted.", "AbortError");
        throw err;
      };

      const req = new Request("http://localhost:3000/api/humandesign/calculate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-dev-secret": "bhumi-dev-bypass",
        },
        body: JSON.stringify({ birthDate: "1985-05-03", birthTime: "23:45", birthPlace: "Jakarta" }),
      });
      const res = await POST(req);
      test("Upstream Timeout returns HTTP 503 Service Unavailable", res.status === 503);

      globalThis.fetch = originalFetch;
    }

    // 6. Rate Limit -> 429 Too Many Requests
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
            "x-dev-secret": "bhumi-dev-bypass",
          },
          body: JSON.stringify({ birthDate: "1985-05-03", birthTime: "23:45", birthPlace: "Jakarta" }),
        });
        lastRes = await POST(req);
      }
      test("Excessive Requests (25x) triggers HTTP 429 Rate Limit", lastRes?.status === 429);

      globalThis.fetch = originalFetch;
    }

  } finally {
    (process.env as any).NODE_ENV = envBackup;
  }

  console.log(`\nResults: ${passed + failed} tests, ${passed} passed, ${failed} failed`);
  if (failed > 0) process.exit(1);
}

runTests().catch(console.error);
