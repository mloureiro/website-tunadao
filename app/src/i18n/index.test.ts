import { describe, it, expect, vi, afterEach } from 'vitest';
import {
  t,
  getLangFromUrl,
  useTranslations,
  getLocalizedPath,
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
