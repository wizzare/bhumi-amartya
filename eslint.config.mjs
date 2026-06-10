import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "dist/**",
    "coverage/**",
    "node_modules/**",
    "android/**",
    ".venv/**",
    "**/.venv/**",
    "public/_next/**",
    "public/generated/**",
    "lib/humandesign/hdkit/**",
    "lib/humandesign/hdkit-main/**",
    "next-env.d.ts",
  ]),
]);

export default eslintConfig;
