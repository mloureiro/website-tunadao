#!/bin/sh
# check-css-tokens.sh
#
# Guard against undefined CSS custom properties.
#
# Scans all var(--name) usages across app/src/**/*.{astro,css,scss} and
# checks that every referenced custom property is declared somewhere in
# app/src/ (tokens.css OR a component <style> block). Exits 1 with a
# per-token report if any usage references a property that is never defined.
#
# Usage:
#   ./scripts/check-css-tokens.sh        (from repo root)
#   npm run lint:tokens -w app            (via workspace script)
#
# Allowlist — genuine non-token properties that do not need a declaration
# in app/src/ (e.g. properties consumed via a fallback value and intended
# to be overridden by a parent context or left unset). Add with a comment.
# --------------------------------------------------------------------------
ALLOWLIST="
--color-surface-alt
--stats-columns
--t
"
# --color-surface-alt: used only as var(--color-surface-alt, #f5f5f5) in
#   ResponsiveImage.astro — the fallback IS the value; no declaration needed.
# --stats-columns: set via inline style attribute in StatsBar.astro
#   (style={columns ? `--stats-columns: ${columns}` : undefined}); consumed
#   with a numeric fallback in the same file — not a global token.
# --t: set via inline style attribute in VerticalTimeline.astro and
#   MilestonesTimeline.astro (style={`--t: ${t};`}); drives a gradient
#   animation — component-local, not a global token.
# --------------------------------------------------------------------------

set -eu

# Resolve the repo root relative to this script.
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
SRC="$REPO_ROOT/app/src"

if [ ! -d "$SRC" ]; then
  printf 'ERROR: app/src directory not found at %s\n' "$SRC" >&2
  exit 2
fi

# Temp files for POSIX-compatible sort/comm (no bash process substitution).
TMP_DEF="$(mktemp)"
TMP_USED="$(mktemp)"
TMP_FILTERED="$(mktemp)"
# shellcheck disable=SC2064
trap "rm -f '$TMP_DEF' '$TMP_USED' '$TMP_FILTERED'" EXIT

# --- 1. Build the defined set ---
# Extract every custom-property declaration (--name:) across all source files.
# This includes tokens.css and component-local <style> blocks.
grep -rho '[[:space:]][[:space:]]*--[a-z0-9][a-z0-9-]*[[:space:]]*:' "$SRC" \
    --include='*.css' --include='*.scss' --include='*.astro' \
  | sed 's/^[[:space:]]*//' \
  | sed 's/[[:space:]]*:$//' \
  | sort -u > "$TMP_DEF"

# --- 2. Build the used set ---
# Extract every var(--name…) reference, stripping any fallback after a comma.
# var(--x, fallback)  →  --x
grep -rho 'var(--[a-z0-9][a-z0-9-]*' "$SRC" \
    --include='*.css' --include='*.scss' --include='*.astro' \
  | sed 's/^var(//' \
  | sort -u > "$TMP_USED"

# --- 3. Apply allowlist ---
# Copy the used set then remove allowlisted entries one by one.
cp "$TMP_USED" "$TMP_FILTERED"
for entry in $ALLOWLIST; do
  entry="$(printf '%s' "$entry" | sed 's/^[[:space:]]*//' | sed 's/[[:space:]]*$//')"
  [ -z "$entry" ] && continue
  # Remove exact matches; if no match grep exits 1 — allow that.
  grep -v "^${entry}$" "$TMP_FILTERED" > "${TMP_FILTERED}.tmp" || true
  mv "${TMP_FILTERED}.tmp" "$TMP_FILTERED"
done

# --- 4. Diff: used but not defined ---
# comm -13: lines only in the second file (used but not defined).
OFFENDERS="$(comm -13 "$TMP_DEF" "$TMP_FILTERED")"

if [ -z "$OFFENDERS" ]; then
  printf 'CSS token check passed: no undefined custom properties found.\n'
  exit 0
fi

# --- 5. Report each offender with the files that reference it ---
printf 'ERROR: The following CSS custom properties are used but never defined:\n\n' >&2
for token in $OFFENDERS; do
  printf '  %s\n' "$token" >&2
  # Show every file and line that references this token.
  grep -rn "var($token" "$SRC" \
      --include='*.css' --include='*.scss' --include='*.astro' \
    | sed "s|$REPO_ROOT/||" \
    | sed 's/^/    /' >&2
  printf '\n' >&2
done
printf 'Fix: declare the property in app/src/styles/tokens.css (or add it to\n' >&2
printf 'the ALLOWLIST in scripts/check-css-tokens.sh if it is intentionally\n' >&2
printf 'component-local or always used with a fallback).\n' >&2
exit 1
