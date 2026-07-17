import { readFileSync } from "node:fs";
import {
  runVedicPageSourceFixtures,
  runVedicPresentationFixtures,
} from "../lib/vedic/presentation.fixtures";

const results = runVedicPresentationFixtures();
results.push(...runVedicPageSourceFixtures(
  readFileSync("app/blueprint/vedic/page.tsx", "utf8"),
  readFileSync("app/profile/page.tsx", "utf8"),
));
const failed = results.filter((result) => !result.passed);

for (const result of results) {
  console.log(`${result.passed ? "PASS" : "FAIL"}: ${result.name}${result.passed ? "" : ` — ${result.detail}`}`);
}

console.log(`VEDIC_R5_FIXTURES=${results.length - failed.length}/${results.length}`);
if (failed.length > 0) process.exitCode = 1;
