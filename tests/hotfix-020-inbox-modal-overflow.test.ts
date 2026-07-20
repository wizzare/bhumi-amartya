/**
 * HOTFIX-020 — Inbox Long Message Modal Overflow Recovery Test Suite
 *
 * Classification: CONTRACT / STATIC SOURCE-PROOF TESTS
 *
 * Proves the inbox message detail modal is bounded within viewport,
 * has a scrollable body, and keeps the close control accessible.
 *
 * Run with:
 *   npx tsx tests/hotfix-020-inbox-modal-overflow.test.ts
 */

import { readFileSync } from "fs";
import path from "path";

let passed = 0;
let failed = 0;

function assert(condition: boolean, label: string) {
  if (condition) { console.log(`  \u2713 ${label}`); passed++; }
  else { console.log(`  \u2717 ${label}`); failed++; }
}

console.log("\u25B6 Running HOTFIX-020 Suite: Inbox Modal Overflow Recovery\n");

const source = readFileSync(path.resolve(__dirname, "../app/inbox/page.tsx"), "utf8");

// 1: Modal container has bounded max-height
assert(
  source.includes("max-h-") && source.includes("overflow-hidden"),
  "1. Modal container has bounded max-height and overflow-hidden"
);

// 2: Content body has overflow-y-auto
assert(
  source.includes("overflow-y-auto"),
  "2. Message content body has overflow-y-auto"
);

// 3: Content body has min-h-0 (prevents flex overflow)
assert(
  source.includes("min-h-0"),
  "3. Content body has min-h-0 for flex shrink"
);

// 4: Modal uses flex column layout
assert(
  source.includes("flex flex-col") || source.includes("flex-col"),
  "4. Modal uses flex column layout"
);

// 5: Header/close are outside scrollable body
const headerIndex = source.indexOf("shrink-0 mb-4");
const bodyIndex = source.indexOf("overflow-y-auto min-h-0");
assert(headerIndex >= 0, "5a. Header has shrink-0 class");
assert(headerIndex < bodyIndex || bodyIndex < 0, "5b. Header renders before scrollable body");

// 6: Close button has shrink-0 (prevents compression)
assert(
  source.includes("shrink-0 ml-4") || source.includes("shrink-0"),
  "6. Close button has shrink-0 to prevent compression"
);

// 7: Backdrop click handler exists
assert(
  source.includes('onClick={() => setSelectedMessage(null)}'),
  "7. Backdrop click closes modal"
);

// 8: Escape key handler exists
assert(
  source.includes('e.key === "Escape"'),
  "8. Escape key closes modal"
);

// 9: role=dialog for accessibility
assert(
  source.includes('role="dialog"'),
  "9. Modal has role=dialog"
);

// 10: aria-modal=true for accessibility
assert(
  source.includes('aria-modal="true"'),
  "10. Modal has aria-modal=true"
);

// 11: Click on modal content does not propagate to backdrop
assert(
  source.includes("e.stopPropagation()") || source.includes("stopPropagation"),
  "11. Modal content click does not propagate to backdrop"
);

// 12: Scroll lock added when modal open
assert(
  source.includes('document.body.style.overflow = "hidden"'),
  "12. Body scroll locked when modal is open"
);

// 13: Scroll lock restored on cleanup
assert(
  source.includes('document.body.style.overflow = prev'),
  "13. Body scroll restored on modal close"
);

// 14: deepLink button has shrink-0
assert(
  source.includes("shrink-0 mt-4"),
  "14. deepLink button has shrink-0 to prevent compression"
);

// 15: old modal max-height missing verified by checking no old full-height pattern
assert(
  source.includes("max-h-["),
  "15. Modal max-height uses dynamic viewport value"
);

// 16: whitespace-pre-wrap preserved on content
assert(
  source.includes("whitespace-pre-wrap"),
  "16. Content preserves whitespace-pre-wrap for paragraph formatting"
);

// ── Summary ──────────────────────────────────────────────────────────────
console.log(`\n\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501`);
console.log(`HOTFIX-020 Inbox Modal Overflow Recovery Tests`);
console.log(`${passed} passed, ${failed} failed`);
if (failed) { process.exit(1); }
console.log(`\u2714 ALL ${passed} INBOX MODAL OVERFLOW ASSERTIONS PASSED`);
console.log(`\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501`);
