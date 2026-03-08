import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";
import reactPlugin from "eslint-plugin-react";

const disabledReactRules = Object.fromEntries(
  Object.keys(reactPlugin.rules).map((ruleName) => [
    `react/${ruleName}`,
    "off",
  ]),
);

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    rules: {
      // eslint-plugin-react 7.37.x is not fully compatible with ESLint 10 in
      // our vinext lint path and crashes while resolving context filenames.
      // Disable react/* rules here to keep CI stable until plugin support lands.
      ...disabledReactRules,
    },
  },
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "dist/**",
    ".wrangler/**",
    "next-env.d.ts",
  ]),
]);

export default eslintConfig;
