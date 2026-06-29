import { describe, it, expect } from 'vitest';
import { buildSitemapUrl } from '@utils/url';

// ──────────────────────────────────────────────
// buildSitemapUrl — pure helper
// ──────────────────────────────────────────────

describe('buildSitemapUrl()', () => {
  it('handles interim subdir with trailing slash in both args', () => {
    expect(buildSitemapUrl('http://loureiro.me', '/website-tunadao/')).toBe(
      'http://loureiro.me/website-tunadao/sitemap-index.xml'
    );
  });

  it('is idempotent on slashes — trailing slash on siteUrl, no trailing slash on base', () => {
    expect(buildSitemapUrl('http://loureiro.me/', '/website-tunadao')).toBe(
      'http://loureiro.me/website-tunadao/sitemap-index.xml'
    );
  });

  it('handles root base (final production config)', () => {
    expect(buildSitemapUrl('https://tunadao1998.ipv.pt', '/')).toBe(
      'https://tunadao1998.ipv.pt/sitemap-index.xml'
    );
  });

  it('handles empty base — treated as root', () => {
    expect(buildSitemapUrl('https://tunadao1998.ipv.pt', '')).toBe(
      'https://tunadao1998.ipv.pt/sitemap-index.xml'
    );
  });

  it('strips multiple trailing slashes from siteUrl', () => {
    expect(buildSitemapUrl('http://loureiro.me///', '/website-tunadao/')).toBe(
      'http://loureiro.me/website-tunadao/sitemap-index.xml'
    );
  });

  it('adds leading slash to base when missing', () => {
    expect(buildSitemapUrl('http://loureiro.me', 'website-tunadao')).toBe(
      'http://loureiro.me/website-tunadao/sitemap-index.xml'
    );
  });
});

// ──────────────────────────────────────────────
// robots.txt endpoint body shape
// ──────────────────────────────────────────────
// We test the output via the buildSitemapUrl helper + the expected template,
// since the endpoint itself depends on import.meta.env which is injected by
// Astro's Vite build and is not directly mockable in Vitest happy-dom.
//
// The integration contract (env → URL) is verified by the interim build
// assertion (npm run test:build-output -w app) which inspects dist/robots.txt.

describe('robots.txt body contract', () => {
  it('contains required directives for interim subdir deployment', () => {
    // Simulate what the endpoint would emit for:
    //   SITE_URL=http://loureiro.me  BASE_URL=/website-tunadao/
    const siteUrl = 'http://loureiro.me';
    const base = '/website-tunadao/';

    const sitemapUrl = buildSitemapUrl(siteUrl, base);

    const body = [
      '# https://www.robotstxt.org/robotstxt.html',
      'User-agent: *',
      'Allow: /',
      'Disallow: /dev/',
      '',
      `Sitemap: ${sitemapUrl}`,
      '',
    ].join('\n');

    expect(body).toContain('User-agent: *');
    expect(body).toContain('Disallow: /dev/');
    expect(body).toContain('Sitemap: http://loureiro.me/website-tunadao/sitemap-index.xml');

    // Must have exactly one Sitemap: line
    const sitemapLines = body.split('\n').filter((l) => l.startsWith('Sitemap:'));
    expect(sitemapLines).toHaveLength(1);
  });

  it('contains correct sitemap URL for root (final production) deployment', () => {
    const siteUrl = 'https://tunadao1998.ipv.pt';
    const base = '/';

    const sitemapUrl = buildSitemapUrl(siteUrl, base);

    expect(sitemapUrl).toBe('https://tunadao1998.ipv.pt/sitemap-index.xml');

    const body = [
      '# https://www.robotstxt.org/robotstxt.html',
      'User-agent: *',
      'Allow: /',
      'Disallow: /dev/',
      '',
      `Sitemap: ${sitemapUrl}`,
      '',
    ].join('\n');

    expect(body).toContain('Disallow: /dev/');
    expect(body).toContain('Sitemap: https://tunadao1998.ipv.pt/sitemap-index.xml');
  });

  it('points to sitemap-index.xml, not sitemap-0.xml', () => {
    const sitemapUrl = buildSitemapUrl('http://loureiro.me', '/website-tunadao/');
    expect(sitemapUrl).toMatch(/sitemap-index\.xml$/);
    expect(sitemapUrl).not.toMatch(/sitemap-0\.xml/);
  });
});
