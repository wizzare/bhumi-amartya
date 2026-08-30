// ESLint 9 flat config for the standalone billing-verifier service.
// The `lint` script (`eslint api lib`) previously matched no config and lint-ed
// zero files. This config parses the service's own TypeScript source.
import tseslint from "typescript-eslint";

export default tseslint.config(
  {
    ignores: ["node_modules/**", "tests/**", "scripts/**"],
  },
  ...tseslint.configs.recommended,
  {
    files: ["api/**/*.ts", "lib/**/*.ts"],
    languageOptions: {
      parserOptions: {
        ecmaVersion: 2022,
        sourceType: "module",
      },
    },
    rules: {
      // Keep the gate meaningful but not noisy; do not weaken to force green.
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/no-unused-vars": ["error", { argsIgnorePattern: "^_", varsIgnorePattern: "^_" }],
    },
  },
);
