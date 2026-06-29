import type { APIRoute } from 'astro';
import { buildSitemapUrl } from '@utils/url';

// Astro's static-prerender SSG mode: this endpoint becomes dist/robots.txt at build time.
export const prerender = true;

export const GET: APIRoute = () => {
  // Astro exposes import.meta.env.SITE (from the `site` astro.config.mjs option,
  // which in turn reads process.env.SITE_URL). This is the canonical origin.
  // import.meta.env.BASE_URL is Astro's normalised base (leading + trailing slash
  // for non-root bases, '/' for root) — injected automatically from `base` config.
  const siteUrl = import.meta.env.SITE ?? '';
  const base = import.meta.env.BASE_URL ?? '/';

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

  return new Response(body, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
    },
  });
};
