#!/usr/bin/env node
/**
 * Static env-parity check (ARCHITECTURE §3.2).
 *
 * Asserts: every env var that cms/src reads at runtime is declared in
 * cms/render.yaml. Exits non-zero and lists missing vars if any are absent.
 *
 * No new dependencies — pure Node (fs, path, readline-less line iteration).
 *
 * Run via: npm run check:env -w cms
 */

import { readFileSync, readdirSync, statSync } from 'fs';
import { join, resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const CMS_ROOT = resolve(__dirname, '..');
const SRC_DIR = join(CMS_ROOT, 'src');
const RENDER_YAML = join(CMS_ROOT, 'render.yaml');

// Vars intentionally NOT in render.yaml:
//   - seed/tooling only: ADMIN_EMAIL, ADMIN_PASSWORD, ADMIN_NAME
//   - framework implicit (Render always sets it; no need to declare): NODE_ENV
const ALLOW_LIST = new Set([
  'ADMIN_EMAIL',
  'ADMIN_PASSWORD',
  'ADMIN_NAME',
  'NODE_ENV',
]);

// ---------------------------------------------------------------------------
// 1. Collect all process.env.VAR_NAME references from cms/src/**
// ---------------------------------------------------------------------------

/** Recursively collect all .ts / .tsx / .js files under a directory. */
function collectSourceFiles(dir) {
  const results = [];
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    const stat = statSync(full);
    if (stat.isDirectory()) {
      results.push(...collectSourceFiles(full));
    } else if (/\.(tsx?|js)$/.test(entry)) {
      results.push(full);
    }
  }
  return results;
}

const ENV_VAR_RE = /process\.env\.([A-Z_][A-Z_0-9]*)/g;

function extractEnvVars(files) {
  const vars = new Set();
  for (const file of files) {
    const content = readFileSync(file, 'utf8');
    for (const match of content.matchAll(ENV_VAR_RE)) {
      vars.add(match[1]);
    }
  }
  return vars;
}

const sourceFiles = collectSourceFiles(SRC_DIR);
const readVars = extractEnvVars(sourceFiles);

// ---------------------------------------------------------------------------
// 2. Parse declared keys from cms/render.yaml
// ---------------------------------------------------------------------------

const KEY_LINE_RE = /^\s*-\s+key:\s+([A-Z_][A-Z_0-9]*)\s*$/;

function parseRenderYamlKeys(yamlPath) {
  const keys = new Set();
  const lines = readFileSync(yamlPath, 'utf8').split('\n');
  for (const line of lines) {
    const match = KEY_LINE_RE.exec(line);
    if (match) {
      keys.add(match[1]);
    }
  }
  return keys;
}

const declaredKeys = parseRenderYamlKeys(RENDER_YAML);

// ---------------------------------------------------------------------------
// 3. Compare: runtime read-set minus allow-list must be ⊆ declared keys
// ---------------------------------------------------------------------------

const missing = [];
for (const v of readVars) {
  if (!ALLOW_LIST.has(v) && !declaredKeys.has(v)) {
    missing.push(v);
  }
}

if (missing.length === 0) {
  console.log(
    `✓ env-parity OK — all ${readVars.size} runtime env vars are declared in render.yaml ` +
    `(${readVars.size - ALLOW_LIST.size} checked, ${[...readVars].filter(v => ALLOW_LIST.has(v)).length} allow-listed).`,
  );
  process.exit(0);
} else {
  console.error('✗ env-parity FAIL — the following vars are read by cms/src but missing from render.yaml:');
  for (const v of missing.sort()) {
    console.error(`  • ${v}`);
  }
  console.error('\nAdd them to cms/render.yaml under envVars with sync: false (or a value if static).');
  process.exit(1);
}
