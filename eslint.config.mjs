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
    ".pytest_cache/**",
    "**/.pytest_cache/**",
    "scratch/**",
    "scripts/**",
    "services/**",
    "run-test.js",
    "scratch*.js",
    "scratch*.ts",
    "scratch*.tsx",
    "test-full-flow.ts",
    "test_*.js",
    ".venv/**",
    "**/.venv/**",
    "public/_next/**",
    "public/generated/**",
    "lib/humandesign/hdkit/**",
    "lib/humandesign/hdkit-main/**",
    "next-env.d.ts",
  ]),
  {
    rules: {
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/ban-ts-comment": "off",
      "prefer-const": "off",
      "react-hooks/preserve-manual-memoization": "off",
      "react-hooks/purity": "off",
      "react-hooks/set-state-in-effect": "off",
      "react/no-unescaped-entities": "off",
    },
  },
]);

export default eslintConfig;
