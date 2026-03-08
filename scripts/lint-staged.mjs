#!/usr/bin/env node

import { execSync, spawnSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const scriptDirectory = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(scriptDirectory, "..");
const apiRoot = path.join(repoRoot, "apps/api");

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
    cwd: repoRoot,
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
  ["exec", "eslint", "--max-warnings=0", "--no-warn-ignored", ...filesToLint],
  { stdio: "inherit", cwd: apiRoot },
);

if (typeof result.status === "number") {
  process.exit(result.status);
}

process.exit(1);
