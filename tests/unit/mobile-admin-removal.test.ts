import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";

assert.equal(existsSync("app/admin/page.tsx"), false);
assert.equal(existsSync("app/admin/activity/page.tsx"), false);
assert.equal(existsSync("components/admin/AdminInboxWorkspace.tsx"), false);

const appNav = readFileSync("components/navigation/AppNav.tsx", "utf8");
assert.doesNotMatch(appNav, /href:\s*["']\/admin/);
assert.doesNotMatch(appNav, /ADMIN_ITEM/);

console.log("MOBILE_ADMIN_REMOVAL_PASS assertions=5");
