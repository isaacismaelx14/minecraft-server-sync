#!/usr/bin/env node

import { execSync, spawnSync } from "node:child_process";

const ESLINT_EXTENSIONS = new Set([
  ".js",
  ".jsx",
  ".cjs",
  ".mjs",
  ".ts",
  ".tsx",
]);

function getStagedFiles() {
  const output = execSync("git diff --cached --name-only --diff-filter=ACM", {
    encoding: "utf8",
  }).trim();

  if (!output) {
    return [];
  }

  return output
    .split("\n")
    .map((file) => file.trim())
    .filter(Boolean);
}

function isEslintFile(file) {
  const dotIndex = file.lastIndexOf(".");
  if (dotIndex === -1) return false;
  const ext = file.slice(dotIndex);
  return ESLINT_EXTENSIONS.has(ext);
}

const stagedFiles = getStagedFiles();
const filesToLint = stagedFiles
  .filter((file) => file.startsWith("apps/api/"))
  .filter(isEslintFile)
  .map((file) => file.replace(/^apps\/api\//, ""));

if (filesToLint.length === 0) {
  console.log("No staged API JS/TS files to lint.");
  process.exit(0);
}

console.log(`Linting ${filesToLint.length} staged API file(s)...`);

const result = spawnSync(
  "pnpm",
  ["exec", "eslint", "--max-warnings=0", ...filesToLint],
  { stdio: "inherit", cwd: "apps/api" },
);

if (typeof result.status === "number") {
  process.exit(result.status);
}

process.exit(1);
