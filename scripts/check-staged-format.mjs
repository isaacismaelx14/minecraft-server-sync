#!/usr/bin/env node

import { execSync, spawnSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const scriptDirectory = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(scriptDirectory, "..");

const PRETTIER_EXTENSIONS = new Set([
  ".js",
  ".cjs",
  ".mjs",
  ".ts",
  ".tsx",
  ".jsx",
  ".json",
  ".yml",
  ".yaml",
  ".css",
  ".scss",
  ".html",
]);

function isInSrcDirectory(file) {
  return file.split("/").includes("src");
}

const output = execSync("git diff --cached --name-only --diff-filter=ACM", {
  encoding: "utf8",
  cwd: repoRoot,
}).trim();

if (!output) {
  process.exit(0);
}

const stagedFiles = output
  .split(/\r?\n/u)
  .map((entry) => entry.trim())
  .filter((entry) => entry.length > 0);

const filesToCheck = stagedFiles.filter((file) => {
  if (!isInSrcDirectory(file)) {
    return false;
  }

  const lower = file.toLowerCase();
  const extensionIndex = lower.lastIndexOf(".");
  if (extensionIndex === -1) {
    return false;
  }
  return PRETTIER_EXTENSIONS.has(lower.slice(extensionIndex));
});

if (filesToCheck.length === 0) {
  process.exit(0);
}

const result = spawnSync(
  "pnpm",
  [
    "exec",
    "prettier",
    "--check",
    "--ignore-path",
    ".prettierignore",
    ...filesToCheck,
  ],
  {
    stdio: "inherit",
    cwd: repoRoot,
  },
);

if (typeof result.status === "number") {
  process.exit(result.status);
}

process.exit(1);
