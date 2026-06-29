import { describe, it, expect, vi, afterEach } from 'vitest';
import {
  t,
  getLangFromUrl,
  useTranslations,
  getLocalizedPath,
  getLang,
  getAlternateLang,
  resolve,
  ordinal,
  defaultLang,
  flattenKeys,
  IDENTICAL_VALUE_ALLOWLIST,
} from './index';
import pt from './pt.json';
import en from './en.json';

describe('i18n', () => {
  describe('t()', () => {
    it('should return translation for valid key in default language', () => {
      expect(t('nav.home')).toBe('Início');
    });

    it('should return translation for valid key in English', () => {
      expect(t('nav.home', 'en')).toBe('Home');
    });

    it('should return nested translation', () => {
      expect(t('home.cta.about')).toBe('Conhecer a história');
      expect(t('home.cta.about', 'en')).toBe('Discover our history');
    });

    it('should return key when translation not found (compile-time catch)', () => {
      // @ts-expect-error — intentional invalid key to document compile-time enforcement
      expect(t('non.existent.key')).toBe('non.existent.key');
    });
  });

  describe('getLangFromUrl()', () => {
    it('should return default language for root path', () => {
      const url = new URL('https://example.com/');
      expect(getLangFromUrl(url)).toBe('pt');
    });

    it('should return English for /en/ path', () => {
      const url = new URL('https://example.com/en/');
      expect(getLangFromUrl(url)).toBe('en');
    });

    it('should return Portuguese for /pt/ path', () => {
      const url = new URL('https://example.com/pt/');
      expect(getLangFromUrl(url)).toBe('pt');
    });

    it('should return default language for unknown language', () => {
      const url = new URL('https://example.com/fr/');
      expect(getLangFromUrl(url)).toBe('pt');
    });
  });

  describe('useTranslations()', () => {
    it('should return a function that translates keys', () => {
      const tPt = useTranslations('pt');
      const tEn = useTranslations('en');

      expect(tPt('nav.about')).toBe('Sobre Nós');
      expect(tEn('nav.about')).toBe('About Us');
    });
  });

  describe('getLocalizedPath()', () => {
    it('should return path without prefix for default language', () => {
      expect(getLocalizedPath('/about', 'pt')).toBe('/about');
    });

    it('should return path with prefix for non-default language', () => {
      expect(getLocalizedPath('/about', 'en')).toBe('/en/about');
    });

    it('should handle root path', () => {
      expect(getLocalizedPath('/', 'pt')).toBe('/');
      expect(getLocalizedPath('/', 'en')).toBe('/en/');
    });
  });

  // ---------------------------------------------------------------------------
  // getLocalizedPath edge cases [mroy][1vx5]
  // ---------------------------------------------------------------------------
  describe('getLocalizedPath() — edge cases', () => {
    afterEach(() => {
      vi.unstubAllEnvs();
    });

    it('strips /en/ prefix and returns bare path when targeting PT', () => {
      // An already-prefixed /en/ path converted to the PT (default) locale
      expect(getLocalizedPath('/en/citadao/2024', 'pt')).toBe('/citadao/2024');
    });

    it('strips /en/ prefix on multi-segment path when targeting EN', () => {
      // Path that already has /en/ prefix — should not double-prefix
      expect(getLocalizedPath('/en/citadao/2024', 'en')).toBe('/en/citadao/2024');
    });

    it('converts bare multi-segment path to EN', () => {
      // PT path with no prefix → EN with /en/ prefix
      expect(getLocalizedPath('/citadao/2024', 'en')).toBe('/en/citadao/2024');
    });

    it('converts trailing-slash /en/ to bare / for PT', () => {
      // /en/ trailing-slash → PT root /
      expect(getLocalizedPath('/en/', 'pt')).toBe('/');
    });

    it('does not produce double base when BASE_URL is a subdirectory', () => {
      // Simulate a subdirectory deployment (e.g. GitHub Pages)
      vi.stubEnv('BASE_URL', '/website-tunadao/');
      // getLocalizedPath strips the base from the incoming path before
      // re-adding it, so the base must appear exactly once in the result.
      const result = getLocalizedPath('/website-tunadao/en/citadao', 'pt');
      // Expect: base prepended once, no /website-tunadao/website-tunadao/
      const doubleBase = result.includes('/website-tunadao/website-tunadao');
      expect(doubleBase, `Double base detected in: ${result}`).toBe(false);
      // The citadao segment must still be present
      expect(result).toContain('citadao');
    });

    it('builds correct EN path under a subdirectory base', () => {
      vi.stubEnv('BASE_URL', '/website-tunadao/');
      const result = getLocalizedPath('/citadao', 'en');
      // Should be /website-tunadao/en/citadao — single base, /en/ prefix
      expect(result).toBe('/website-tunadao/en/citadao');
    });
  });

  describe('defaultLang', () => {
    it('should be Portuguese', () => {
      expect(defaultLang).toBe('pt');
    });
  });
});

// ---------------------------------------------------------------------------
// Key-parity test [6poe]
// ---------------------------------------------------------------------------
describe('i18n key parity', () => {
  it('PT and EN have identical key sets (1:1 parity)', () => {
    const ptKeys = flattenKeys(pt as unknown as Record<string, unknown>);
    const enKeys = flattenKeys(en as unknown as Record<string, unknown>);
    // Deep-equal: both sorted arrays must be identical length + same keys
    expect(ptKeys).toEqual(enKeys);
  });
});

// ---------------------------------------------------------------------------
// Value-parity guard + allowlist [jdeb]
// ---------------------------------------------------------------------------
describe('i18n value-parity guard', () => {
  const ptFlat = new Map(
    flattenKeys(pt as unknown as Record<string, unknown>).map((k) => [
      k,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      k.split('.').reduce((o: any, seg) => o?.[seg], pt) as string,
    ])
  );
  const enFlat = new Map(
    flattenKeys(en as unknown as Record<string, unknown>).map((k) => [
      k,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      k.split('.').reduce((o: any, seg) => o?.[seg], en) as string,
    ])
  );

  it('every path with identical PT/EN value is in IDENTICAL_VALUE_ALLOWLIST', () => {
    // A new accidental untranslated EN string (identical to PT, not on the
    // allowlist) must fail this test. Add to allowlist only if it is a
    // genuine proper noun / brand / universal term.
    const unlisted: string[] = [];
    for (const [path, ptVal] of ptFlat) {
      const enVal = enFlat.get(path);
      if (ptVal === enVal && !(IDENTICAL_VALUE_ALLOWLIST as readonly string[]).includes(path)) {
        unlisted.push(`${path}: ${JSON.stringify(ptVal)}`);
      }
    }
    expect(unlisted, 'Identical PT/EN values not in IDENTICAL_VALUE_ALLOWLIST').toEqual([]);
  });

  it('IDENTICAL_VALUE_ALLOWLIST has no stale entries (all listed paths still have equal values)', () => {
    // An allowlisted path whose PT and EN values have diverged means the
    // allowlist is outdated — the path should be removed.
    const stale: string[] = [];
    for (const path of IDENTICAL_VALUE_ALLOWLIST) {
      const ptVal = ptFlat.get(path);
      const enVal = enFlat.get(path);
      if (ptVal !== enVal) {
        stale.push(`${path}: PT=${JSON.stringify(ptVal)} EN=${JSON.stringify(enVal)}`);
      }
    }
    expect(stale, 'Stale IDENTICAL_VALUE_ALLOWLIST entries (values now differ)').toEqual([]);
  });
});

// ---------------------------------------------------------------------------
// getLang / getAlternateLang [6poe][1vx5]
// ---------------------------------------------------------------------------
describe('getLang()', () => {
  it('returns the known locale when astroLocale is a valid language key', () => {
    expect(getLang('en')).toBe('en');
    expect(getLang('pt')).toBe('pt');
  });

  it('falls back to URL-derived language when astroLocale is unknown', () => {
    const url = new URL('https://example.com/en/about');
    expect(getLang('xx', url)).toBe('en');
  });

  it('falls back to URL-derived language when astroLocale is undefined', () => {
    const url = new URL('https://example.com/en/');
    expect(getLang(undefined, url)).toBe('en');
  });

  it('returns default language when astroLocale is unknown and no URL given', () => {
    expect(getLang('fr')).toBe(defaultLang);
  });

  it('returns default language when astroLocale is undefined and no URL given', () => {
    expect(getLang(undefined)).toBe(defaultLang);
  });
});

describe('getAlternateLang()', () => {
  it('returns EN for PT', () => {
    expect(getAlternateLang('pt')).toBe('en');
  });

  it('returns PT for EN', () => {
    expect(getAlternateLang('en')).toBe('pt');
  });
});

// ---------------------------------------------------------------------------
// Fallback cascade [dfzt] — tested with asymmetric stubs via resolve()
// ---------------------------------------------------------------------------
describe('t() deep fallback cascade', () => {
  // resolve() is exported @internal so we can test the cascade logic directly
  // without depending on the real (symmetric) JSON files.

  it('resolve() returns undefined when a key is missing in the tree', () => {
    const tree = { nav: { home: 'Início' } };
    expect(resolve(tree, ['nav', 'missing'])).toBeUndefined();
    expect(resolve(tree, ['missing'])).toBeUndefined();
    expect(resolve(tree, ['nav', 'home', 'deeper'])).toBeUndefined();
  });

  it('resolve() returns the string value for an exact match', () => {
    const tree = { nav: { home: 'Home', about: 'About' } };
    expect(resolve(tree, ['nav', 'home'])).toBe('Home');
    expect(resolve(tree, ['nav', 'about'])).toBe('About');
  });

  it('t() interpolation: {count} replaced in PT', () => {
    // citadao.about.p2 contains {count} in both locales
    const result = t('citadao.about.p2', 'pt', { count: 21 });
    expect(result).toContain('21');
    expect(result).not.toContain('{count}');
  });

  it('t() interpolation: {count} replaced in EN', () => {
    const result = t('citadao.about.p2', 'en', { count: 21 });
    expect(result).toContain('21');
    expect(result).not.toContain('{count}');
  });

  it('t() leaves unmatched {token} literal when vars omitted', () => {
    // Calling t() without vars should leave {count} as-is (no-op)
    const result = t('citadao.about.p2', 'pt');
    expect(result).toContain('{count}');
  });

  it('t() returns raw key for a completely unknown key (both langs miss)', () => {
    // @ts-expect-error — intentional: testing runtime miss behavior for deep missing key
    const result = t('this.key.does.not.exist.anywhere');
    expect(result).toBe('this.key.does.not.exist.anywhere');
  });
});

// ---------------------------------------------------------------------------
// ordinal(n, lang) [vaeb]
// ---------------------------------------------------------------------------
describe('ordinal()', () => {
  describe('PT — uniform feminine ordinal mark', () => {
    it('ordinal(1, "pt") → "1ª"', () => expect(ordinal(1, 'pt')).toBe('1ª'));
    it('ordinal(19, "pt") → "19ª"', () => expect(ordinal(19, 'pt')).toBe('19ª'));
    it('defaults to PT when lang is omitted', () => expect(ordinal(5)).toBe('5ª'));
  });

  describe('EN — suffix with 11–13 exception', () => {
    it('ordinal(1, "en") → "1st"', () => expect(ordinal(1, 'en')).toBe('1st'));
    it('ordinal(2, "en") → "2nd"', () => expect(ordinal(2, 'en')).toBe('2nd'));
    it('ordinal(3, "en") → "3rd"', () => expect(ordinal(3, 'en')).toBe('3rd'));
    it('ordinal(4, "en") → "4th"', () => expect(ordinal(4, 'en')).toBe('4th'));

    // Teens exception — 11, 12, 13 always use 'th'
    it('ordinal(11, "en") → "11th"', () => expect(ordinal(11, 'en')).toBe('11th'));
    it('ordinal(12, "en") → "12th"', () => expect(ordinal(12, 'en')).toBe('12th'));
    it('ordinal(13, "en") → "13th"', () => expect(ordinal(13, 'en')).toBe('13th'));

    // Resumes normal pattern after 13
    it('ordinal(19, "en") → "19th"', () => expect(ordinal(19, 'en')).toBe('19th'));

    // Twenties resume the 1st/2nd/3rd pattern
    it('ordinal(21, "en") → "21st"', () => expect(ordinal(21, 'en')).toBe('21st'));
  });
});
