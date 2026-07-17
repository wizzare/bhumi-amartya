import { readFileSync } from "node:fs";
import { runTzolkinPageSourceFixtures, runTzolkinPresentationFixtures } from "../lib/tzolkin/presentation.fixtures";

const results = runTzolkinPresentationFixtures();
results.push(...runTzolkinPageSourceFixtures(
  readFileSync("app/blueprint/tzolkin/page.tsx", "utf8"),
  readFileSync("app/profile/page.tsx", "utf8"),
  readFileSync("lib/tzolkin/presentation.ts", "utf8"),
));
const failed = results.filter((result) => !result.passed);
for (const result of results) console.log(`${result.passed ? "PASS" : "FAIL"}: ${result.name}${result.passed ? "" : ` — ${result.detail}`}`);
console.log(`TZOLKIN_R5_FIXTURES=${results.length - failed.length}/${results.length}`);
if (failed.length > 0) process.exitCode = 1;
