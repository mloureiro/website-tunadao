#!/usr/bin/env node
/**
 * Build-output consistency assertion.
 *
 * Reads dist/ after an interim-origin build and verifies:
 *   1. dist/robots.txt has Disallow: /dev/ and the correct Sitemap: URL.
 *   2. dist/sitemap-index.xml references the expected origin+base.
 *   3. dist/index.html canonical + og:url use the expected origin+base.
 *   4. No phantom hosts (tunadao.pt, www.loureiro.me, tunadao1998.github.io)
 *      remain anywhere in dist/.
 *
 * Expected env vars (set by the CI step that runs this script):
 *   EXPECTED_ORIGIN  e.g. http://loureiro.me
 *   EXPECTED_BASE    e.g. /website-tunadao/   (with trailing slash)
 *
 * Usage:
 *   node app/scripts/check-build-output.mjs
 *
 * Exit 0 = all assertions passed.
 * Exit 1 = one or more assertions failed (errors printed to stderr).
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DIST = path.resolve(__dirname, '..', 'dist');

const EXPECTED_ORIGIN = process.env.EXPECTED_ORIGIN ?? 'http://loureiro.me';
// Normalise: ensure trailing slash
const rawBase = process.env.EXPECTED_BASE ?? '/website-tunadao/';
const EXPECTED_BASE = rawBase.endsWith('/') ? rawBase : `${rawBase}/`;
const EXPECTED_PREFIX = `${EXPECTED_ORIGIN}${EXPECTED_BASE}`;
const EXPECTED_SITEMAP_URL = `${EXPECTED_PREFIX}sitemap-index.xml`;

const PHANTOM_HOSTS = ['tunadao.pt', 'www.loureiro.me', 'tunadao1998.github.io'];

let failed = false;

function fail(msg) {
  console.error(`\n  FAIL: ${msg}`);
  failed = true;
}

function pass(msg) {
  console.log(`  OK:   ${msg}`);
}

// ── 1. robots.txt ────────────────────────────────────────────────────────────

const robotsPath = path.join(DIST, 'robots.txt');
if (!fs.existsSync(robotsPath)) {
  fail(`dist/robots.txt not found`);
} else {
  const robots = fs.readFileSync(robotsPath, 'utf8');

  if (robots.includes('Disallow: /dev/')) {
    pass('robots.txt has Disallow: /dev/');
  } else {
    fail('robots.txt is missing "Disallow: /dev/"');
  }

  const sitemapLines = robots
    .split('\n')
    .filter((l) => l.startsWith('Sitemap:'));

  if (sitemapLines.length === 1) {
    pass('robots.txt has exactly one Sitemap: line');
  } else {
    fail(`robots.txt has ${sitemapLines.length} Sitemap: lines (expected 1)`);
  }

  if (sitemapLines[0] === `Sitemap: ${EXPECTED_SITEMAP_URL}`) {
    pass(`robots.txt Sitemap: = ${EXPECTED_SITEMAP_URL}`);
  } else {
    fail(
      `robots.txt Sitemap: mismatch\n    got:      ${sitemapLines[0]}\n    expected: Sitemap: ${EXPECTED_SITEMAP_URL}`
    );
  }
}

// ── 2. sitemap-index.xml ─────────────────────────────────────────────────────

const sitemapIndexPath = path.join(DIST, 'sitemap-index.xml');
if (!fs.existsSync(sitemapIndexPath)) {
  fail('dist/sitemap-index.xml not found');
} else {
  const sitemapIndex = fs.readFileSync(sitemapIndexPath, 'utf8');

  if (sitemapIndex.includes(EXPECTED_PREFIX)) {
    pass(`sitemap-index.xml references expected origin+base (${EXPECTED_PREFIX})`);
  } else {
    fail(
      `sitemap-index.xml does not reference "${EXPECTED_PREFIX}"\n    First 300 chars: ${sitemapIndex.slice(0, 300)}`
    );
  }
}

// ── 3. index.html canonical + og:url ─────────────────────────────────────────

const indexPath = path.join(DIST, 'index.html');
if (!fs.existsSync(indexPath)) {
  fail('dist/index.html not found');
} else {
  const index = fs.readFileSync(indexPath, 'utf8');

  const canonicalMatch = index.match(/rel="canonical"\s+href="([^"]+)"/);
  if (canonicalMatch) {
    if (canonicalMatch[1].startsWith(EXPECTED_ORIGIN)) {
      pass(`index.html canonical = ${canonicalMatch[1]}`);
    } else {
      fail(`index.html canonical does not start with "${EXPECTED_ORIGIN}"\n    got: ${canonicalMatch[1]}`);
    }
  } else {
    fail('index.html missing canonical link');
  }

  const ogUrlMatch = index.match(/property="og:url"\s+content="([^"]+)"/);
  if (ogUrlMatch) {
    if (ogUrlMatch[1].startsWith(EXPECTED_ORIGIN)) {
      pass(`index.html og:url = ${ogUrlMatch[1]}`);
    } else {
      fail(`index.html og:url does not start with "${EXPECTED_ORIGIN}"\n    got: ${ogUrlMatch[1]}`);
    }
  } else {
    fail('index.html missing og:url meta tag');
  }
}

// ── 4. No phantom hosts ───────────────────────────────────────────────────────

/**
 * Recursively walk a directory and return all file paths.
 * @param {string} dir
 * @returns {string[]}
 */
function walkDir(dir) {
  const results = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      results.push(...walkDir(fullPath));
    } else {
      results.push(fullPath);
    }
  }
  return results;
}

// Only check text files where phantom hosts would meaningfully appear
const TEXT_EXTS = new Set(['.html', '.txt', '.xml', '.json', '.js', '.css', '.mjs']);

const distFiles = walkDir(DIST).filter((f) =>
  TEXT_EXTS.has(path.extname(f).toLowerCase())
);

let phantomFound = false;
for (const file of distFiles) {
  const content = fs.readFileSync(file, 'utf8');
  for (const phantom of PHANTOM_HOSTS) {
    if (content.includes(phantom)) {
      fail(`Phantom host "${phantom}" found in ${path.relative(DIST, file)}`);
      phantomFound = true;
    }
  }
}
if (!phantomFound) {
  pass(`No phantom hosts (${PHANTOM_HOSTS.join(', ')}) found in dist/`);
}

// ── 5. No dropped-slash base joins ───────────────────────────────────────────
//
// When BASE_PATH is set (e.g. /website-tunadao) and Astro emits BASE_URL
// without a trailing slash, a naïve `${BASE_URL}asset.ext` join produces
// `/website-tunadaoasset.ext` — a 404.  We detect any href/src/content
// attribute value that starts with the base path immediately followed by a
// non-slash character.
//
// Only meaningful when the base is non-root (i.e. not just '/').
//
// Example of a bad value: /website-tunadaoimages/logo/tunadao-logo.svg
// Example of a good value: /website-tunadao/images/logo/tunadao-logo.svg

const BASE_WITHOUT_SLASH = EXPECTED_BASE.replace(/\/$/, ''); // '/website-tunadao'

if (BASE_WITHOUT_SLASH && BASE_WITHOUT_SLASH !== '') {
  // Regex matches: href="/website-tunadaoXXX", src="/website-tunadaoXXX",
  // content="/website-tunadaoXXX" — where XXX is not '/' or '"'
  const droppedSlashRe = new RegExp(
    `(?:href|src|content)="${BASE_WITHOUT_SLASH}[^/"']`,
    'g'
  );

  const htmlFiles = walkDir(DIST).filter((f) => path.extname(f).toLowerCase() === '.html');

  let droppedSlashFound = false;
  for (const file of htmlFiles) {
    const content = fs.readFileSync(file, 'utf8');
    const matches = content.match(droppedSlashRe);
    if (matches) {
      for (const m of matches) {
        fail(
          `Dropped-slash base join in ${path.relative(DIST, file)}: ${m.slice(0, 80)}`
        );
        droppedSlashFound = true;
      }
    }
  }
  if (!droppedSlashFound) {
    pass(`No dropped-slash base joins found in dist/**/*.html`);
  }
} else {
  pass(`Skipping dropped-slash check (base is root "/", no join ambiguity)`);
}

// ── Summary ───────────────────────────────────────────────────────────────────

if (failed) {
  console.error('\nBuild-output assertion FAILED — see errors above.\n');
  process.exit(1);
} else {
  console.log('\nAll build-output assertions passed.\n');
}
