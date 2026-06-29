/**
 * CMS Client fallback cascade tests
 *
 * Tests cover:
 * 1. Fixture mode (USE_TEST_FIXTURES=true) — no network, fixtures returned
 * 2. Default + CMS OK — live data returned
 * 3. Default + CMS unreachable / error — warn + fixture fallback (two sub-cases)
 * 4. FORCE_PROD_CMS + unreachable — throws CMSError
 * 5. Globals branch (getSiteSettings via fetchGlobal/globalFixtures)
 *
 * Pattern: each test re-imports the module after setting process.env and
 * resetting modules, ensuring the env is captured fresh at module load time.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

beforeEach(() => {
  delete process.env.USE_TEST_FIXTURES;
  delete process.env.FORCE_PROD_CMS;
  vi.resetModules();
});

afterEach(() => {
  vi.unstubAllGlobals();
  delete process.env.USE_TEST_FIXTURES;
  delete process.env.FORCE_PROD_CMS;
});

describe('CMS client fallback cascade', () => {
  describe('getCitadaoEditions()', () => {
    it('returns fixture docs and never calls fetch when USE_TEST_FIXTURES=true', async () => {
      process.env.USE_TEST_FIXTURES = 'true';

      const fetchSpy = vi.fn(() => {
        throw new Error('no network');
      });
      vi.stubGlobal('fetch', fetchSpy);

      const client = await import('./client');
      const editions = await client.getCitadaoEditions();

      expect(Array.isArray(editions)).toBe(true);
      expect(editions.length).toBeGreaterThan(0);
      expect(fetchSpy).not.toHaveBeenCalled();
    });

    it('returns live data (sentinel id 999) when CMS is reachable (default mode)', async () => {
      const livePayload = {
        docs: [
          {
            id: 999,
            status: 'published',
            startDate: '2020-01-01',
            endDate: '2020-01-02',
            title: 'LIVE',
            editionNumber: 99,
          },
        ],
        totalDocs: 1,
        limit: 100,
        totalPages: 1,
        page: 1,
        pagingCounter: 1,
        hasPrevPage: false,
        hasNextPage: false,
        prevPage: null,
        nextPage: null,
      };

      const fetchMock = vi
        .fn()
        .mockResolvedValue(new Response(JSON.stringify(livePayload), { status: 200 }));
      vi.stubGlobal('fetch', fetchMock);

      const client = await import('./client');
      const editions = await client.getCitadaoEditions();

      expect(editions).toHaveLength(1);
      expect(editions[0].id).toBe(999);
      expect(fetchMock).toHaveBeenCalledOnce();
    });

    it('returns fixture docs and emits [CMS:Fallback] warn when fetch rejects (default mode)', async () => {
      const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

      const fetchMock = vi.fn().mockRejectedValue(new Error('ECONNREFUSED'));
      vi.stubGlobal('fetch', fetchMock);

      const client = await import('./client');
      const editions = await client.getCitadaoEditions();

      expect(Array.isArray(editions)).toBe(true);
      expect(editions.length).toBeGreaterThan(0);
      expect(warnSpy).toHaveBeenCalledWith(expect.stringContaining('[CMS:Fallback]'));

      warnSpy.mockRestore();
    });

    it('returns fixture docs and emits [CMS:Fallback] warn when fetch returns 500 (default mode)', async () => {
      const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

      const fetchMock = vi
        .fn()
        .mockResolvedValue(new Response('Internal Server Error', { status: 500 }));
      vi.stubGlobal('fetch', fetchMock);

      const client = await import('./client');
      const editions = await client.getCitadaoEditions();

      expect(Array.isArray(editions)).toBe(true);
      expect(editions.length).toBeGreaterThan(0);
      expect(warnSpy).toHaveBeenCalledWith(expect.stringContaining('[CMS:Fallback]'));

      warnSpy.mockRestore();
    });

    it('throws CMSError when FORCE_PROD_CMS=true and fetch rejects', async () => {
      process.env.FORCE_PROD_CMS = 'true';

      const fetchMock = vi.fn().mockRejectedValue(new Error('ECONNREFUSED'));
      vi.stubGlobal('fetch', fetchMock);

      const client = await import('./client');

      await expect(client.getCitadaoEditions()).rejects.toMatchObject({
        name: 'CMSError',
      });
    });
  });

  describe('getSiteSettings() — globals branch', () => {
    it('returns a global fixture object when USE_TEST_FIXTURES=true', async () => {
      process.env.USE_TEST_FIXTURES = 'true';

      const fetchSpy = vi.fn(() => {
        throw new Error('no network');
      });
      vi.stubGlobal('fetch', fetchSpy);

      const client = await import('./client');
      const settings = await client.getSiteSettings();

      // The fixture returns a site-settings global with at least siteName
      expect(settings).toBeDefined();
      expect(typeof settings.siteName).toBe('string');
      expect(fetchSpy).not.toHaveBeenCalled();
    });
  });
});
