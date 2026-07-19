import fs from "node:fs";

const service = fs.readFileSync("lib/services/appUpdateService.ts", "utf8");
const policy = fs.readFileSync("lib/services/appUpdatePolicy.ts", "utf8");
const checker = fs.readFileSync("components/global/VersionChecker.tsx", "utf8");
const native = fs.readFileSync("android/app/src/main/java/com/bhumiamartya/app/AppUpdatePlugin.java", "utf8");

const checks: Array<[string, boolean]> = [
  ["canonical Firestore app_config/version owner", service.includes('"app_config", "version"')],
  ["policy distinguishes immediate and flexible", policy.includes('"immediate_required"') && policy.includes('"flexible_available"')],
  ["flexible resume states exposed", service.includes("downloading") && service.includes("downloaded")],
  ["download completion action guarded", checker.includes('updateAction === "completing"') && checker.includes("completeFlexibleUpdate")],
  ["immediate native start exists", service.includes("startImmediateUpdate") && native.includes("startImmediate")],
  ["developer-triggered immediate resume exists", service.includes("resumeImmediateUpdate") && native.includes("DEVELOPER_TRIGGERED_UPDATE_IN_PROGRESS")],
  ["web/PWA is a no-op", service.includes('return "unavailable"')],
  ["no external APK path", !native.toLowerCase().includes("unknown source") && !native.toLowerCase().includes("apk")],
  ["single app-state listener owner", checker.split('appStateChange').length - 1 === 1],
];

const failures = checks.filter(([, passed]) => !passed).map(([name]) => name);
if (failures.length) {
  console.error("APP_UPDATE_LIFECYCLE_VALIDATION_FAIL");
  failures.forEach((failure) => console.error(`- ${failure}`));
  process.exit(1);
}
console.log("APP_UPDATE_LIFECYCLE_VALIDATION_PASS");
