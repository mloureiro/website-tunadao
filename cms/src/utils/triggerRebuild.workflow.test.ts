import { describe, it, expect } from 'vitest';
import { readFileSync, existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

// Offline stand-in for "the dispatched workflow file resolves".
// Asserts that ci.yml exists on disk and declares workflow_dispatch.
describe('.github/workflows/ci.yml static check', () => {
  // Navigate from cms/src/utils/ up 3 levels to the repo root
  const dir = dirname(fileURLToPath(import.meta.url));
  const ciYmlPath = resolve(dir, '../../../.github/workflows/ci.yml');

  it('ci.yml exists in the repository', () => {
    expect(existsSync(ciYmlPath)).toBe(true);
  });

  it('ci.yml declares workflow_dispatch', () => {
    const content = readFileSync(ciYmlPath, 'utf-8');
    expect(content).toContain('workflow_dispatch');
  });
});
