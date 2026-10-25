import { spawn } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import http from "node:http";
import { chromium } from "playwright";
import { runGuardSelfTests } from "./hd05cHarnessNetworkGuard.mjs";
import { startMockHdEngine } from "./hd05cMockHdEngine.mjs";
import { flowD } from "./hd05dFlowD.mjs";
import { flowA } from "./hd05daFlowA.mjs";
import { flowB } from "./hd05dBirthRevision.mjs";
import { flowC } from "./hd05cRecoveryRetries.mjs";
import { flowClosure } from "./hd05dClosureAcceptance.mjs";

const HARNESS_DIR = "C:/Users/shein/AppData/Local/Temp/opencode/hd05c-harness";
function resetEngineControl(engine) {
  const c = engine.control;
  c.armed = false; c.fail = false; c.started = 0; c.released = 0; c.flowAOnly = false;
  c.flowBOnly = false; c.flowCOnly = false; c.statusOverride = null; c.headersOverride = null; c.hang = false; c.responseOverride = null;
  c.release = () => {};
  engine.resetCalls();
}
async function run() {
  const evidence = fs.mkdtempSync(path.join(HARNESS_DIR, `HD05D2-${Date.now()}-`));
  const safety = await runGuardSelfTests();
  const engine = await startMockHdEngine(18765);
  const rootDir = fs.mkdtempSync(path.join(HARNESS_DIR, "hd05d-workspace-"));
  const denied = /(?:^|[\\/])(?:\.env[^\\/]*|\.git|node_modules|\.next|[^\\/]*(?:credential|service.?account|firebase-adminsdk|keystore)[^\\/]*)(?:[\\/]|$)|\.(?:pem|key|p12|jks)$/i;
  for (const name of ["app", "components", "context", "contexts", "hooks", "lib", "src", "styles", "types", "public", "tests/helpers", "tests/fixtures", "package.json", "tsconfig.json", "next-env.d.ts", "next.config.ts", "postcss.config.mjs"]) {
    const source = path.join(process.cwd(), name);
    if (fs.existsSync(source)) fs.cpSync(source, path.join(rootDir, name), { recursive: true, filter: entry => !denied.test(entry) && !fs.lstatSync(entry).isSymbolicLink() });
  }
  fs.symlinkSync(path.join(process.cwd(), "node_modules"), path.join(rootDir, "node_modules"), "junction");
  const recoveryFile = path.join(rootDir, 'lib/humandesign/hdRecovery.ts');
  const original = fs.readFileSync(recoveryFile, 'utf8');
  const signature = 'export function recoverHumanDesignIfNeeded(deps: HdRecoveryDeps): Promise<HdRecoveryResult> {';
  if (!original.includes(signature)) throw new Error('Recovery instrumentation contract changed');
  const wrapperCode = [
    '\nconst __hd05d_wrapped_recoveries = new WeakMap<Promise<HdRecoveryResult>, Promise<HdRecoveryResult>>();',
    'export function recoverHumanDesignIfNeeded(deps: HdRecoveryDeps): Promise<HdRecoveryResult> {',
    '  const p = originalRecovery(deps);',
    '  const existing = __hd05d_wrapped_recoveries.get(p);',
    '  if (existing) return existing;',
    '  const probe = (globalThis as any).__HD05D_RECOVERY__ ??= { started: 0, settled: 0, actions: [] };',
    '  probe.started++;',
    '  const wrapped = p.then(result => { probe.actions.push(result.action); return result; }).finally(() => { probe.settled++; });',
    '  __hd05d_wrapped_recoveries.set(p, wrapped);',
    '  return wrapped;',
    '}\n'
  ].join('\n');
  fs.writeFileSync(recoveryFile, original.replace(signature, 'function originalRecovery(deps: HdRecoveryDeps): Promise<HdRecoveryResult> {') + wrapperCode);
  const env = {
    SystemRoot: process.env.SystemRoot, TEMP: HARNESS_DIR, TMP: HARNESS_DIR,
    NEXT_TELEMETRY_DISABLED: "1", NODE_OPTIONS: `--import=${JSON.stringify(new URL('./hd05cHarnessNetworkGuard.mjs', import.meta.url).href)}`,
    NODE_ENV: "development", BHUMI_LOCAL_QA: "0", BHUMI_HARNESS_MOCK: "1",
    NEXT_PUBLIC_FIREBASE_PROJECT_ID: "demo-build110-local", NEXT_PUBLIC_FIREBASE_API_KEY: "mock-key",
    NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: "demo-build110-local.firebaseapp.com", NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET: "demo-build110-local.appspot.com",
    NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID: "123456789", NEXT_PUBLIC_FIREBASE_APP_ID: "1:123456789:web:mock",
    NEXT_PUBLIC_HUMAN_DESIGN_API_URL: "http://127.0.0.1:18765/calculate", NEXT_PUBLIC_BILLING_VERIFIER_URL: "http://localhost:3001",
    NEXT_PUBLIC_USE_FIREBASE_EMULATORS: "false", NEXT_PUBLIC_USE_AUTH_EMULATOR: "false", NEXT_PUBLIC_USE_FIRESTORE_EMULATOR: "false", NEXT_PUBLIC_USE_FUNCTIONS_EMULATOR: "false",
  };
  await new Promise((resolve, reject) => {
    const child = spawn(process.execPath, ['--input-type=module', '-e', "import assert from 'node:assert/strict'; assert.equal(globalThis.__HD05D_GUARD__,true); await assert.rejects(fetch('https://hd05d.invalid'), /GUARD/);"], { cwd: rootDir, env, stdio: 'ignore' });
    child.on('error', reject); child.on('exit', code => code === 0 ? resolve() : reject(new Error('Child guard failed')));
  });
  fs.writeFileSync(path.join(evidence, 'safety.json'), JSON.stringify({ ...safety, childPreload: 'PASS', instrumentation: 'temporary copy promise settlement only' }));
  const log = fs.createWriteStream(path.join(evidence, 'server.jsonl'), { flags: 'wx' });
  const server = spawn(process.execPath, [path.resolve('node_modules/next/dist/bin/next'), 'dev', '--webpack', '-H', '127.0.0.1', '-p', '3001'], { cwd: rootDir, env, stdio: ['ignore', 'pipe', 'pipe'] });
  const record = chunk => {
    const text = chunk.toString();
    const category = /GUARD.*BLOCKED/.test(text) ? 'expected-guard-block' : /error|unhandled|⨯/i.test(text) ? 'server-error' : /warn|⚠/i.test(text) ? 'server-warning' : 'server-info';
    log.write(JSON.stringify({ category, bytes: chunk.length, text: text.slice(0, 300) }) + '\n');
  };
  server.stdout.on('data', record); server.stderr.on('data', record);
  let browser;
  try {
    const deadline = Date.now() + 120000;
    let ready = false;
    while (!ready && Date.now() < deadline) {
      ready = await new Promise(resolve => { const request = http.get('http://127.0.0.1:3001/login/', response => { response.resume(); resolve([200, 307, 308].includes(response.statusCode)); }); request.on('error', () => resolve(false)); });
      if (!ready) await new Promise(resolve => setTimeout(resolve, 250));
    }
    if (!ready) throw new Error('Local Next startup deadline');
    browser = await chromium.launch({ headless: true, env: { SystemRoot: process.env.SystemRoot, TEMP: HARNESS_DIR, TMP: HARNESS_DIR }, args: ['--disable-background-networking', '--disable-default-apps', '--disable-extensions', '--disable-sync', '--no-default-browser-check'] });
    const flowCPassed = await flowC(browser, engine, evidence);
    resetEngineControl(engine);
    const flowAPassed = await flowA(browser, engine, evidence);
    resetEngineControl(engine);
    const flowBPassed = await flowB(browser, engine, evidence);
    resetEngineControl(engine);
    const flowDPassed = await flowD(browser, engine, evidence);
    resetEngineControl(engine);
    const closurePassed = await flowClosure(browser, engine, evidence);
    process.exitCode = flowCPassed && flowAPassed && flowBPassed && flowDPassed && closurePassed ? 0 : 1;
  } finally {
    await browser?.close();
    await new Promise(resolve => { const child = spawn('taskkill', ['/pid', String(server.pid), '/f', '/t'], { stdio: 'ignore' }); child.on('exit', resolve); });
    engine.closeAllConnections(); engine.close(); log.end();
    console.log(`EVIDENCE ${evidence} EXIT ${process.exitCode ?? 0}`);
  }
}
run().catch((err) => { console.error('HD05D harness failed; inspect unique server evidence:', err); process.exitCode = 1; });
