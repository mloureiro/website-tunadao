import { describe, it, expect } from 'vitest';
import { t, getLangFromUrl, useTranslations, getLocalizedPath, defaultLang } from './index';

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

  describe('defaultLang', () => {
    it('should be Portuguese', () => {
      expect(defaultLang).toBe('pt');
    });
  });
});
