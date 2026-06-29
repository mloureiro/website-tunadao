import pt from './pt.json';
import en from './en.json';

export const languages = {
  pt: 'Português',
  en: 'English',
} as const;

export const languageFlags: Record<string, string> = {
  pt: '🇵🇹',
  en: '🇬🇧',
};

export type Language = keyof typeof languages;

export const defaultLang: Language = 'pt';

export const translations = {
  pt,
  en,
} as const;

/**
 * BCP-47 locale codes for each language.
 * Single source of truth for html[lang] and hreflang alternates.
 * The sitemap uses the same set (pt-PT / en-US) in astro.config.mjs.
 */
export const langBcp47: Record<Language, string> = {
  pt: 'pt-PT',
  en: 'en-US',
};

/**
 * Recursive dot-path type over a translation tree.
 * Produces only leaf-string paths (e.g. 'nav.home', 'home.cta.about').
 * PT is the source of truth; EN parity is enforced by the parity test.
 */
export type DotPaths<T> = T extends string
  ? never
  : {
      [K in keyof T & string]: T[K] extends string ? K : `${K}.${DotPaths<T[K]>}`;
    }[keyof T & string];

/**
 * Walk a translation tree by an array of keys.
 * Returns the leaf string value, or undefined on any miss.
 */
function resolve(tree: unknown, keys: string[]): string | undefined {
  let node: unknown = tree;
  for (const k of keys) {
    if (node && typeof node === 'object' && k in (node as Record<string, unknown>)) {
      node = (node as Record<string, unknown>)[k];
    } else {
      return undefined;
    }
  }
  return typeof node === 'string' ? node : undefined;
}

/**
 * Replace {key} tokens in a string using a vars map.
 * Unmatched tokens are left literal. No-op when vars is undefined.
 */
function interpolate(value: string, vars: Record<string, string | number>): string {
  return value.replace(/\{(\w+)\}/g, (m, k: string) => (k in vars ? String(vars[k]) : m));
}

/**
 * Get a nested translation value by dot-separated path.
 * Falls back to the default language (PT) on any miss in the requested lang.
 * Returns the raw key if the path is missing in both languages.
 *
 * @example
 * t('nav.home')           // → 'Início'  (PT default)
 * t('nav.home', 'en')    // → 'Home'
 * t('citadao.about.p2', 'pt', { count: 21 })  // → '…21 edições…'
 */
export function t(
  key: DotPaths<typeof pt>,
  lang: Language = defaultLang,
  vars?: Record<string, string | number>
): string {
  const keys = key.split('.');
  let value = resolve(translations[lang], keys);

  if (value === undefined && lang !== defaultLang) {
    value = resolve(translations[defaultLang], keys);
  }

  if (value === undefined) {
    return key;
  }

  return vars ? interpolate(value, vars) : value;
}

/**
 * Create a typed translation function bound to a specific language.
 * The returned function accepts optional interpolation vars.
 */
export function useTranslations(lang: Language) {
  return (key: DotPaths<typeof pt>, vars?: Record<string, string | number>) => t(key, lang, vars);
}

/**
 * Get the language from the URL path.
 */
export function getLangFromUrl(url: URL): Language {
  const base = import.meta.env.BASE_URL || '/';
  let pathname = url.pathname;

  // Remove base path if present
  if (base !== '/' && pathname.startsWith(base)) {
    pathname = pathname.slice(base.length - 1); // Keep leading slash
  }

  const [, lang] = pathname.split('/');
  if (lang in translations) {
    return lang as Language;
  }
  return defaultLang;
}

/**
 * Get language from Astro's currentLocale or URL.
 */
export function getLang(astroLocale: string | undefined, url?: URL): Language {
  if (astroLocale && astroLocale in translations) {
    return astroLocale as Language;
  }
  if (url) {
    return getLangFromUrl(url);
  }
  return defaultLang;
}

/**
 * Get the base URL from Astro config, normalized (without trailing slash).
 */
function getBase(): string {
  const base = import.meta.env.BASE_URL || '/';
  // Remove trailing slash for consistent path building
  return base.endsWith('/') ? base.slice(0, -1) : base;
}

/**
 * Get localized path — converts a path to the correct language version.
 * Includes the base URL from Astro config for subdirectory deployments.
 * @param path - The path to localize (e.g., '/sobre')
 * @param lang - Target language
 */
export function getLocalizedPath(path: string, lang: Language): string {
  const base = getBase();

  // Remove base path if present (handles paths from Astro.url.pathname)
  let cleanPath = path;
  if (base && cleanPath.startsWith(base)) {
    cleanPath = cleanPath.slice(base.length) || '/';
  }

  // Remove any existing language prefix
  for (const l of Object.keys(languages)) {
    if (cleanPath.startsWith(`/${l}/`)) {
      cleanPath = cleanPath.slice(l.length + 1);
      break;
    } else if (cleanPath === `/${l}`) {
      cleanPath = '/';
      break;
    }
  }

  // Build the final path with base and language prefix
  if (lang === defaultLang) {
    return cleanPath === '/' ? base || '/' : `${base}${cleanPath}`;
  }
  return `${base}/${lang}${cleanPath}`;
}

/**
 * Get the alternate language.
 */
export function getAlternateLang(lang: Language): Language {
  return lang === 'pt' ? 'en' : 'pt';
}

/**
 * Flatten a nested translation object to a sorted array of dot-path strings.
 * Only string leaves are included; intermediate objects are not.
 * Used by the key-parity test to assert PT and EN trees have identical keys.
 *
 * @example
 * flattenKeys({ nav: { home: 'Início', about: 'Sobre Nós' } })
 * // → ['nav.about', 'nav.home']
 */
export function flattenKeys(obj: Record<string, unknown>, prefix = ''): string[] {
  const keys: string[] = [];
  for (const k of Object.keys(obj)) {
    const path = prefix ? `${prefix}.${k}` : k;
    const value = (obj as Record<string, unknown>)[k];
    if (typeof value === 'string') {
      keys.push(path);
    } else if (typeof value === 'object' && value !== null) {
      keys.push(...flattenKeys(value as Record<string, unknown>, path));
    }
  }
  return keys.sort();
}
