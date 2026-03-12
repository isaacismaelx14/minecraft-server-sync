#!/usr/bin/env node

import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(scriptDir, "..");
const nvmrcPath = path.join(repoRoot, ".nvmrc");

function readRequiredNodeVersion() {
  const raw = readFileSync(nvmrcPath, "utf8").trim();
  if (!raw) {
    throw new Error(".nvmrc is empty.");
  }
  return raw.replace(/^v/i, "");
}

function toMajorMinor(version) {
  const parts = version.split(".");
  if (parts.length < 2) {
    throw new Error(`Invalid version format: ${version}`);
  }
  const major = Number(parts[0]);
  const minor = Number(parts[1]);
  if (!Number.isInteger(major) || !Number.isInteger(minor)) {
    throw new Error(`Invalid numeric version: ${version}`);
  }
  return `${major}.${minor}`;
}

const required = readRequiredNodeVersion();
const actual = process.versions.node;

if (toMajorMinor(actual) !== toMajorMinor(required)) {
  console.error(
    [
      `Node version mismatch: expected ${required} (from .nvmrc), got ${actual}.`,
      "Use the project version before pushing to avoid CI-only failures:",
      "  nvm install",
      "  nvm use",
    ].join("\n"),
  );
  process.exit(1);
}

console.log(`Node version check passed (${actual}).`);
