import { spawnSync } from "node:child_process";
const guard = new URL("../tests/helpers/build115-network-guard.mjs", import.meta.url).href;
const env = { ...process.env, NODE_OPTIONS: `--import="${guard}"`, npm_config_offline: "true", npm_config_update_notifier: "false", npm_config_audit: "false", FORCE_COLOR: "0" };
const commands = [
  "npx --no-install tsx tests/unit/build115-hd-audit.test.ts",
  "npx --no-install tsx lib/humandesign/liveContract.test.ts",
  "npx --no-install tsx lib/humandesign/hdRootCause.test.ts",
  "npx --no-install tsx lib/humandesign/completeness.test.ts",
  "npx --no-install tsx tests/unit/build108-cdi02-hd-advanced-variables.test.ts",
  "npx --no-install tsx --import ./tests/helpers/build115-offline-setup.mts tests/unit/blueprint-timeout-settlement.test.ts",
  "npx tsc --noEmit",
  "npm run lint -- --quiet",
  "git diff --check",
];
const results = commands.map(command => spawnSync(command, { shell: true, env, encoding: "utf8", timeout: 240000, maxBuffer: 16 * 1024 * 1024 }));
const passed = results.map(result => result.status === 0 && !result.error);
const suite = results[0].stdout || "";
const executed = name => passed[0] && suite.split(/\r?\n/).some(line => line.startsWith(`✔ ${name} (`) || line.match(/^ok \d+ - /)?.input?.slice(line.indexOf(" - ") + 3) === name);
const gates = [
  ["PRIVACY_GATE", executed("privacy runtime paths") && executed("settings and banner runtime privacy")],
  ["NETWORK_ISOLATION", executed("network negative controls")],
  ["PERSISTENCE_ISOLATION", executed("persistence negative controls") && executed("repository wrapper negative controls")],
  ["NORMALIZED_PARITY", passed.slice(0, 6).every(Boolean) && executed("five types through app and audit transport")],
  ["ADVANCED_VARIABLES", passed[1] && passed[3] && passed[4]],
  ["TSC", passed[6] && passed[7]],
  ["DIFF_CHECK", passed[8]],
];
for (const [gate, ok] of gates) console.log(`${gate}=${ok ? "PASS" : "FAIL"}`);
if (!passed.every(Boolean) || gates.some(([, ok]) => !ok)) process.exitCode = 1;
