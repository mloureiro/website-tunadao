/**
 * i18n helper for E2E tests.
 *
 * Provides the same `t(key, lang?)` API as the app's i18n module but loads
 * JSON translations via `createRequire` (CommonJS-compatible, works under
 * Playwright's Node.js module loader without needing `with { type: 'json' }`).
 */
import { createRequire } from 'module';

const require = createRequire(import.meta.url);

// Load translations relative to this file's location
// eslint-disable-next-line @typescript-eslint/no-var-requires
const pt = require('../../app/src/i18n/pt.json') as Record<string, unknown>;
// eslint-disable-next-line @typescript-eslint/no-var-requires
const en = require('../../app/src/i18n/en.json') as Record<string, unknown>;

export const languages = {
  pt: 'Português',
  en: 'English',
} as const;

export type Language = keyof typeof languages;

export const defaultLang: Language = 'pt';

const translations: Record<Language, Record<string, unknown>> = { pt, en };

/**
 * Get a nested translation value by dot-separated path.
 * Falls back to the default language when a key is missing in the target lang.
 */
export function t(key: string, lang: Language = defaultLang): string {
  const keys = key.split('.');
  let value: unknown = translations[lang];

  for (const k of keys) {
    if (value && typeof value === 'object' && k in (value as Record<string, unknown>)) {
      value = (value as Record<string, unknown>)[k];
    } else {
      // Fallback to default language
      value = translations[defaultLang];
      for (const fallbackKey of keys) {
        if (value && typeof value === 'object' && fallbackKey in (value as Record<string, unknown>)) {
          value = (value as Record<string, unknown>)[fallbackKey];
        } else {
          return key;
        }
      }
      break;
    }
  }

  return typeof value === 'string' ? value : key;
}
