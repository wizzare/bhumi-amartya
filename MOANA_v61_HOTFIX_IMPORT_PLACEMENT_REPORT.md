# MOANA v61 Hotfix — Import Placement Report

## 1. Root Cause
During automated prompt update operations, an ES type import statement (`import type { DailyGuidanceInput } ...`) was duplicated inside the object literal return block of `buildBhumiSoulMirrorPrompt` (at line 28) rather than remaining strictly at the top-level of the file.

## 2. File Changed
`lib/prompts/bhumiSoulMirrorPrompt.ts`

## 3. Before vs. After
* **Before**:
  ```typescript
  return {
    role: "Bhumi Soul Mirror (Refleksi Jiwa) writer",
    ...
    // Core Data Sources
    import type { DailyGuidanceInput } from "@/lib/orchestrators/types"; // SYNTAX ERROR
    blueprint: { ... }
  };
  ```
* **After**:
  ```typescript
  import type { DailyGuidanceInput } from "@/lib/orchestrators/types"; // Top-level only (Line 1)

  export function buildBhumiSoulMirrorPrompt(...) {
    return {
      role: "Bhumi Soul Mirror (Refleksi Jiwa) writer",
      ...
      blueprint: { ... }
    };
  }
  ```

## 4. Commands Run
* `npx tsc --noEmit` → **PASS** (Zero errors).
* `npm run build` → **PASS** (Compiled successfully, generated all 72 static pages).

## 5. Localhost Smoke Result
**PASS** — Parsing error completely resolved. Dashboard, Refleksi Jiwa, and Catatan Hari Ini render cleanly with zero syntax exceptions.

## 6. Final Status
**PASS**
