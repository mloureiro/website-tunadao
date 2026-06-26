#!/usr/bin/env node
/**
 * Offline migration drift-check (ARCHITECTURE §6b).
 *
 * Detects when a collection's schema has changed without a corresponding
 * committed migration. Run via: npm run migrate:check -w cms
 *
 * Algorithm:
 *   1. Run `payload migrate:create ci_drift --skip-empty` (offline, no DB).
 *      If the committed snapshot already matches the live schema, --skip-empty
 *      writes nothing. If a collection changed, it writes a new *_ci_drift.{ts,json}.
 *   2. Run `git diff --exit-code -- cms/src/migrations` to detect any new/changed files.
 *   3. In finally: delete any *_ci_drift.* artifacts and restore index.ts if touched.
 *   4. Exit with diff's status code (0 = clean, 1 = drift detected).
 *
 * No external dependencies — only node:child_process, node:fs, node:path, node:url.
 */

import { execSync, spawnSync } from 'node:child_process';
import { readdirSync, rmSync, existsSync } from 'node:fs';
import { join, resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Resolve repo root: cms/scripts/ → cms/ → repo root
const REPO_ROOT = resolve(__dirname, '..', '..');
const MIGRATIONS_DIR = join(REPO_ROOT, 'cms', 'src', 'migrations');
const INDEX_TS = join(MIGRATIONS_DIR, 'index.ts');

/** Return all filenames in migrations dir matching the ci_drift pattern. */
function findDriftArtifacts() {
  if (!existsSync(MIGRATIONS_DIR)) return [];
  return readdirSync(MIGRATIONS_DIR).filter(
    (f) => f.includes('_ci_drift.') && (f.endsWith('.ts') || f.endsWith('.json')),
  );
}

/** Delete ci_drift artifacts. Swallows errors (best-effort cleanup). */
function deleteDriftArtifacts() {
  for (const filename of findDriftArtifacts()) {
    try {
      rmSync(join(MIGRATIONS_DIR, filename));
    } catch {
      // swallow — cleanup is best-effort
    }
  }
}

/** Restore index.ts via git checkout (if it was modified by migrate:create). */
function restoreIndexTs() {
  try {
    spawnSync('git', ['checkout', '--', 'cms/src/migrations/index.ts'], {
      cwd: REPO_ROOT,
      stdio: 'inherit',
    });
  } catch {
    // swallow — cleanup is best-effort
  }
}

let diffStatus = 0;

try {
  // Step 1: Run migrate:create ci_drift --skip-empty (offline — no DB connection needed
  // because the SQLite driver reads the committed .json snapshot without opening the DB).
  console.log('Running migration drift check...');
  const createResult = spawnSync(
    'npm',
    ['run', 'payload', '-w', 'cms', '--', 'migrate:create', 'ci_drift', '--skip-empty'],
    {
      cwd: REPO_ROOT,
      stdio: 'inherit',
      env: {
        ...process.env,
        // Ensure no Turso URL bleeds in; use local SQLite path (no file needed for snapshot diff)
        NODE_ENV: process.env.NODE_ENV ?? 'development',
      },
    },
  );

  if (createResult.error) {
    throw createResult.error;
  }

  // Step 2: Check git diff against the migrations directory.
  // `git diff --exit-code` exits 1 if there are changes, 0 if clean.
  const diffResult = spawnSync(
    'git',
    ['diff', '--exit-code', '--', 'cms/src/migrations'],
    {
      cwd: REPO_ROOT,
      stdio: 'inherit',
    },
  );

  diffStatus = diffResult.status ?? 0;
} finally {
  // Step 3: Cleanup — must run regardless of outcome.
  deleteDriftArtifacts();
  restoreIndexTs();
}

// Step 4: Report and exit.
if (diffStatus !== 0) {
  console.error('');
  console.error(
    'Schema drift detected: a collection changed without a committed migration.',
  );
  console.error(
    'Run: npm run migrate:create -w cms -- <name>   then commit cms/src/migrations/*.',
  );
  process.exit(1);
} else {
  console.log('No migration drift.');
  process.exit(0);
}
