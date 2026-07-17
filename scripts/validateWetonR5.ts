import { readFileSync } from "node:fs";
import {
  runWetonPageSourceFixtures,
  runWetonPresentationFixtures,
} from "../lib/weton/presentation.fixtures";

void runWetonPresentationFixtures().then((results) => {
  results.push(...runWetonPageSourceFixtures(readFileSync("app/blueprint/weton/page.tsx", "utf8")));
  const failed = results.filter((result) => !result.passed);

  for (const result of results) {
    console.log(`${result.passed ? "PASS" : "FAIL"}: ${result.name}${result.passed ? "" : ` — ${result.detail}`}`);
  }

  console.log(`WETON_R5_FIXTURES=${results.length - failed.length}/${results.length}`);

  if (failed.length > 0) process.exitCode = 1;
});
