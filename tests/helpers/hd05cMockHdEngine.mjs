import http from "node:http";
import fs from "node:fs";
import path from "node:path";

export function startMockHdEngine(port = 18765) {
  const fixturePath = path.resolve(process.cwd(), "tests/fixtures/build110-hd-local.json");
  const fixtureData = JSON.parse(fs.readFileSync(fixturePath, "utf8"));
  let flowAFixture = null;
  try {
    flowAFixture = JSON.parse(fs.readFileSync(path.resolve(process.cwd(), "tests/fixtures/build110-hd-flowa.json"), "utf8"));
  } catch { flowAFixture = null; }
  let flowBFixture = null;
  try {
    flowBFixture = JSON.parse(fs.readFileSync(path.resolve(process.cwd(), "tests/fixtures/build110-hd-flowb.json"), "utf8"));
  } catch { flowBFixture = null; }
  let flowCFixture = null;
  try {
    flowCFixture = JSON.parse(fs.readFileSync(path.resolve(process.cwd(), "tests/fixtures/build110-hd-flowc.json"), "utf8"));
  } catch { flowCFixture = null; }
  const FLOW_C_BIRTH = "1988-12-05";
  const FLOW_A_BIRTH = "1993-11-02";
  const FLOW_B_BIRTH = "1995-07-20";
  // Sanitized call log: no tokens — only shape-level facts.
  const calls = [];

  const control = { armed: false, started: 0, released: 0, fail: false, failSeen: 0, statusOverride: null, headersOverride: null, hang: false, responseOverride: null, flowBOnly: false, flowAOnly: false, flowCOnly: false, release: () => {} };
  const server = http.createServer((req, res) => {
    // Enable CORS for localhost
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization, x-dev-secret");

    if (req.method === "OPTIONS") {
      res.writeHead(204);
      res.end();
      return;
    }

    if (req.url === "/calculate" && req.method === "POST") {
      let body = "";
      req.on("data", chunk => { body += chunk; });
      req.on("end", () => {
        try {
          const parsed = JSON.parse(body || "{}");
          const flowC = Boolean(control.flowCOnly ? true : flowCFixture && parsed && parsed.birthDate === FLOW_C_BIRTH);
          const flowB = Boolean(!flowC && (control.flowBOnly ? true : flowBFixture && parsed && parsed.birthDate === FLOW_B_BIRTH));
          const flowA = Boolean(!flowC && !flowB && (control.flowAOnly ? true : flowAFixture && parsed && parsed.birthDate === FLOW_A_BIRTH));
          const entry = {
            n: calls.length + 1,
            ts: new Date().toISOString(),
            method: "POST",
            endpoint: "/calculate",
            flowAFixture: flowA,
            flowBFixture: flowB,
            birthRecorded: Boolean(parsed && parsed.birthDate),
            birthTimeRecorded: Boolean(parsed && parsed.birthTime),
            birthDate: parsed?.birthDate || null,
            birthTime: parsed?.birthTime || null,
            birthCity: parsed?.birthCity || null,
            timezone: parsed?.timezone || null,
            held: false,
            status: null,
          };
          calls.push(entry);
          if (control.hang) {
            entry.held = true;
            return;
          }
          if (control.statusOverride) {
            entry.status = control.statusOverride;
            const headers = { "Content-Type": "application/json", ...(control.headersOverride || {}) };
            res.writeHead(control.statusOverride, headers);
            res.end(JSON.stringify(control.responseOverride || { error: "mock_status_" + control.statusOverride }));
            return;
          }
          if (control.fail) {
            control.failSeen++;
            entry.status = 500;
            res.writeHead(500, { "Content-Type": "application/json" });
            res.end(JSON.stringify({ error: "mock_engine_unavailable" }));
            return;
          }
          const respond = () => {
            entry.status = 200;
            res.writeHead(200, { "Content-Type": "application/json" });
            const responsePayload = control.responseOverride
              ? control.responseOverride
              : flowC
                ? flowCFixture
                : flowB
                ? flowBFixture
                : flowA
                  ? flowAFixture
                  : fixtureData;
            res.end(JSON.stringify(responsePayload));
          };
          if (control.armed) {
            entry.held = true;
            control.started++;
            control.release = () => { control.release = () => {}; control.armed = false; control.released++; if (!res.writableEnded && !res.destroyed) respond(); };
          } else respond();
        } catch {
          res.writeHead(400, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ error: "Invalid JSON" }));
        }
      });
      return;
    }

    res.writeHead(404, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ error: "Not found" }));
  });

  return new Promise((resolve, reject) => {
    server.listen(port, "127.0.0.1", () => {
      console.log(`[MOCK HD ENGINE] Listening on http://127.0.0.1:${port}`);
      server.control = control;
      server.calls = calls;
      server.resetCalls = () => { calls.length = 0; };
      resolve(server);
    });
    server.on("error", reject);
  });
}
