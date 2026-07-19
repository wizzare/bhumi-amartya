// Loaded through ts-node in the repository validator command so the
// application's TypeScript path aliases are not required here.
// eslint-disable-next-line @typescript-eslint/no-require-imports
const { evaluateAppUpdateStatus } = require("../lib/services/appUpdatePolicy");

const build = (versionCode: number, platform = "android") => ({
  versionName: "3.2.4",
  versionCode,
  buildNumber: String(versionCode),
  platform,
});

const assert = (condition: boolean, message: string) => {
  if (!condition) throw new Error(`UPDATE_POLICY_VALIDATION_FAIL: ${message}`);
};

const config = { minimumBuild: 70, latestVersion: "3.2.4", forceUpdate: true };
assert(evaluateAppUpdateStatus(build(69), config).isOutdated, "69 below 70 must be blocked");
assert(!evaluateAppUpdateStatus(build(70), config).isOutdated, "70 equal 70 must be allowed");
assert(!evaluateAppUpdateStatus(build(71), config).isOutdated, "71 above 70 must be allowed");
assert(!evaluateAppUpdateStatus(build(70, "web"), config).isOutdated, "web must never be blocked");
assert(evaluateAppUpdateStatus(build(69), config).policy === "immediate_required", "outdated force update must be immediate");
assert(evaluateAppUpdateStatus(build(70), { ...config, forceUpdate: false }).policy === "no_update", "supported build must have no update");
console.log("UPDATE_POLICY_VALIDATION_PASS");
