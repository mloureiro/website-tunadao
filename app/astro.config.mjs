import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import icon from 'astro-icon';

// Single source of truth for the public origin: SITE_URL + BASE_PATH (env vars only).
// Deploys MUST supply these via CI repo vars — defaults below are local-dev placeholders only.
// Interim target: vars.SITE_URL=http://loureiro.me, vars.BASE_PATH=/website-tunadao
// Final target:   vars.SITE_URL=https://tunadao1998.ipv.pt, vars.BASE_PATH= (root)
// Switching origin is a vars change only — no code edit needed. See DEPLOY.md / bead sax7.
const base = process.env.BASE_PATH || '/';

export default defineConfig({
  site: process.env.SITE_URL || 'http://localhost:4321',
  base,
  output: 'static',
  srcDir: './src',
  integrations: [
    icon(),
    sitemap({
      changefreq: 'weekly',
      priority: 0.7,
      lastmod: new Date(),
      i18n: {
        defaultLocale: 'pt',
        locales: {
          pt: 'pt-PT',
          en: 'en-US',
        },
      },
    }),
  ],
  build: {
    assets: '_assets',
  },
  i18n: {
    defaultLocale: 'pt',
    locales: ['pt', 'en'],
    routing: {
      prefixDefaultLocale: false,
    },
  },
  vite: {
    css: {
      preprocessorOptions: {
        scss: {
          api: 'modern-compiler',
        },
      },
    },
  },
});
