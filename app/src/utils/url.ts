/**
 * Pure URL helpers — no Astro runtime dependency, safe to import in Vitest.
 */

/**
 * Normalise a base path value so it always has a leading AND trailing slash.
 *
 * '' or '/' → '/'
 * '/website-tunadao' → '/website-tunadao/'
 * '/website-tunadao/' → '/website-tunadao/'  (idempotent)
 */
export function normalizeBase(base: string): string {
  if (base === '' || base === '/') return '/';
  const withLeading = base.startsWith('/') ? base : `/${base}`;
  return withLeading.endsWith('/') ? withLeading : `${withLeading}/`;
}

/**
 * Build the sitemap index URL from the site origin and Astro's BASE_URL.
 *
 * Rules:
 *   - Strip trailing slash(es) from `siteUrl`         → origin
 *   - Normalise `base`: '' or '/' → '/';
 *     otherwise ensure exactly one leading AND trailing slash
 *     (Astro's BASE_URL already satisfies this — normalisation is defensive
 *     for callers passing a raw BASE_PATH env value).
 *   - Return `${origin}${normalisedBase}sitemap-index.xml`
 *
 * Examples:
 *   buildSitemapUrl('http://loureiro.me', '/website-tunadao/')
 *     → 'http://loureiro.me/website-tunadao/sitemap-index.xml'
 *   buildSitemapUrl('http://loureiro.me/', '/website-tunadao')
 *     → 'http://loureiro.me/website-tunadao/sitemap-index.xml'
 *   buildSitemapUrl('https://tunadao1998.ipv.pt', '/')
 *     → 'https://tunadao1998.ipv.pt/sitemap-index.xml'
 *   buildSitemapUrl('https://tunadao1998.ipv.pt', '')
 *     → 'https://tunadao1998.ipv.pt/sitemap-index.xml'
 */
export function buildSitemapUrl(siteUrl: string, base: string): string {
  // Strip trailing slash(es) from origin
  const origin = siteUrl.replace(/\/+$/, '');
  return `${origin}${normalizeBase(base)}sitemap-index.xml`;
}
