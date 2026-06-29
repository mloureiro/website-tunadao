// Re-export the app's i18n helpers for use in E2E page objects.
// The i18n/index.ts module is plain TypeScript with no Astro-specific imports,
// so it resolves cleanly under Playwright's TS loader.
export { t, defaultLang, type Language } from '../../app/src/i18n/index';
