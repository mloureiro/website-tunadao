import { describe, it, expect } from 'vitest';
import { COLLECTIONS_TO_EXPORT, GLOBALS_TO_EXPORT } from './index';
import { fixtures, globalFixtures } from '../../../app/src/lib/cms/fixtures/index';

describe('Export / fixture parity', () => {
  const exportCollections = new Set(COLLECTIONS_TO_EXPORT.map((c) => c.slug));
  const fixtureCollections = new Set(Object.keys(fixtures));

  const exportGlobals = new Set(GLOBALS_TO_EXPORT);
  const fixtureGlobals = new Set(Object.keys(globalFixtures));

  describe('collections', () => {
    it('every fixture-read collection is exported (no silent data loss in fallback builds)', () => {
      const missing = [...fixtureCollections].sort().filter((k) => !exportCollections.has(k));
      expect(missing, `Collections in fixtures but missing from export: ${missing.join(', ')}`).toEqual([]);
    });

    it('every exported collection is read by a fixture (no dead exports)', () => {
      const extra = [...exportCollections].sort().filter((k) => !fixtureCollections.has(k));
      expect(extra, `Collections in export but missing from fixtures: ${extra.join(', ')}`).toEqual([]);
    });
  });

  describe('globals', () => {
    it('every fixture-read global is exported', () => {
      const missing = [...fixtureGlobals].sort().filter((k) => !exportGlobals.has(k));
      expect(missing, `Globals in fixtures but missing from export: ${missing.join(', ')}`).toEqual([]);
    });

    it('every exported global is read by a fixture', () => {
      const extra = [...exportGlobals].sort().filter((k) => !fixtureGlobals.has(k));
      expect(extra, `Globals in export but missing from fixtures: ${extra.join(', ')}`).toEqual([]);
    });
  });
});
