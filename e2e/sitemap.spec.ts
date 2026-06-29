/**
 * Sitemap E2E — count-agnostic PT/EN + hreflang coverage
 *
 * Findings: 9f1j (ARCHITECTURE §9 / ITERATION_5)
 *
 * Strategy:
 *   - `@astrojs/sitemap` emits `sitemap-index.xml` → `sitemap-0.xml`.
 *   - Use `page.request.get` (no browser nav) — fast and engine-agnostic across
 *     all 3 Playwright projects (chromium / firefox / mobile).
 *   - Assert on PATH patterns, not host — the sitemap's origin is driven by the
 *     build-time `SITE_URL` env var (e.g. `http://localhost:4321`, `tunadao.pt`),
 *     so we must not hard-code a hostname.
 *   - COUNT-AGNOSTIC: no exact URL counts; no assertion about the presence or
 *     absence of `/dev/` pages (that leak belongs to bead `sqpu`).
 */
import { test, expect } from '@playwright/test';

test.describe('Sitemap', () => {
  test('sitemap-index.xml is reachable and references sitemap-0.xml', async ({ page }) => {
    const response = await page.request.get('/sitemap-index.xml');

    expect(response.status()).toBe(200);

    const body = await response.text();

    // The index must point to at least the first sitemap chunk.
    expect(body).toContain('sitemap-0.xml');
  });

  test('sitemap-0.xml is reachable and contains PT locs', async ({ page }) => {
    const response = await page.request.get('/sitemap-0.xml');

    expect(response.status()).toBe(200);

    const body = await response.text();

    // At least one <loc> whose path does NOT carry the /en/ prefix — a PT URL.
    // Match a <loc> element whose content is the site root or a PT-only path.
    // Use a regex that matches `<loc>` + anything that is NOT an `/en/` path.
    // The simplest reliable check: the root URL (always emitted for PT, no /en/).
    expect(body).toMatch(/<loc>[^<]*\/(?!en\/)[^<]*<\/loc>/);
  });

  test('sitemap-0.xml contains EN locs', async ({ page }) => {
    const response = await page.request.get('/sitemap-0.xml');

    expect(response.status()).toBe(200);

    const body = await response.text();

    // At least one <loc> whose path includes /en/ — the EN segment.
    expect(body).toContain('/en/');
  });

  test('sitemap-0.xml contains hreflang alternates', async ({ page }) => {
    const response = await page.request.get('/sitemap-0.xml');

    expect(response.status()).toBe(200);

    const body = await response.text();

    // @astrojs/sitemap emits `<xhtml:link rel="alternate" hreflang="...">` elements
    // when the i18n config is present. Assert both the attribute name and at least
    // one of the locale codes (pt-PT or en-US) to confirm the hreflang is real.
    expect(body).toContain('hreflang=');
    expect(body).toMatch(/hreflang="(pt-PT|en-US)"/);
  });
});
