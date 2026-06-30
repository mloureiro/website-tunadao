/**
 * E2E specs for localized accessible names — i18n-labels.
 *
 * Covers observable behaviors from bead `website-tunadao-w593`:
 *  - Per-locale aria-labels on language selector and theme toggle
 *  - Desktop nav landmark aria-label (desktop projects only)
 *  - ThemeToggle aria-label updates dynamically on toggle
 *  - Skip-link text in each locale
 *
 * Assertion strategy: ALL expected strings are derived from `t(key, lang)`.
 * NO hardcoded locale literals. Web-first assertions only; no waitForTimeout.
 *
 * Stability gate: --repeat-each=5 --retries=0 on all 3 projects (chromium,
 * firefox, mobile). The nav-landmark test SKIPS on the mobile project
 * (iPhone 13, 390 px) because .header__nav is display:none < 1024 px.
 *
 * @see ARCHITECTURE.md §5 and ITERATION_4.md for test design contract.
 */

import { test, expect } from '@playwright/test';
import { t } from './support/i18n';
import type { Language } from './support/i18n';
import { BasePage } from './pages/BasePage';

// ── Locale fixtures ──────────────────────────────────────────────────────────

const locales: { path: string; lang: Language }[] = [
  { path: '/', lang: 'pt' },
  { path: '/en/', lang: 'en' },
];

// ── Key self-check (sanity) ──────────────────────────────────────────────────
// Guards against a regression where someone leaves an EN value equal to PT.

test.describe('i18n key self-check — PT ≠ EN', () => {
  const keysUnderTest = [
    'common.selectLanguage',
    'common.toggleDarkMode',
    'common.switchToLight',
    'common.switchToDark',
    'nav.mainNavigation',
    'common.skipToContent',
  ] as const;

  for (const key of keysUnderTest) {
    test(`${key}: PT value differs from EN value`, () => {
      const ptVal = t(key, 'pt');
      const enVal = t(key, 'en');
      expect(ptVal).not.toBe(enVal);
    });
  }
});

// ── Per-locale control labels ────────────────────────────────────────────────

test.describe('Per-locale control aria-labels', () => {
  for (const { path, lang } of locales) {
    test.describe(`locale ${lang} (${path})`, () => {
      test.beforeEach(async ({ page }) => {
        await page.goto(path);
      });

      test('language selector button has localized aria-label', async ({ page }) => {
        const base = new BasePage(page, lang);
        await expect(base.langButton()).toHaveAttribute(
          'aria-label',
          t('common.selectLanguage', lang),
        );
      });

      test('theme toggle aria-label is one of the two localized action strings', async ({
        page,
      }) => {
        const base = new BasePage(page, lang);
        const toggleLabel = await base.themeToggle().getAttribute('aria-label');
        const validLabels = [t('common.switchToLight', lang), t('common.switchToDark', lang)];
        expect(
          validLabels.includes(toggleLabel ?? ''),
          `Expected aria-label to be one of ${JSON.stringify(validLabels)}, got "${toggleLabel}"`,
        ).toBe(true);
      });
    });
  }
});

// ── Desktop nav landmark aria-label (desktop-only) ───────────────────────────
// .header__nav is display:none below 1024 px; the mobile project (iPhone 13,
// 390 px) must SKIP — not fail.

test.describe('Desktop nav landmark aria-label', () => {
  for (const { path, lang } of locales) {
    test(`locale ${lang} (${path}): .header__nav has localized aria-label`, async ({
      page,
    }) => {
      const viewport = page.viewportSize();
      const isMobile = viewport ? viewport.width < 1024 : false;
      test.skip(isMobile, 'Desktop nav (.header__nav) is hidden on viewports < 1024 px');

      await page.goto(path);
      // Locate by BEM hook, NOT getByRole('navigation') which also matches mobile nav.
      const desktopNav = page.locator('.header__nav');
      await expect(desktopNav).toHaveAttribute('aria-label', t('nav.mainNavigation', lang));
    });
  }
});

// ── ThemeToggle toggle-update ─────────────────────────────────────────────────
// Reset localStorage.theme per test, then assert the aria-label flips to the
// OTHER string after click — deterministic regardless of system prefers-color-scheme.

test.describe('ThemeToggle — aria-label updates on toggle', () => {
  for (const { path, lang } of locales) {
    test(`locale ${lang} (${path}): aria-label flips to opposite after click`, async ({
      page,
    }) => {
      // Reset any persisted theme preference so we start from a clean state.
      await page.goto(path);
      await page.evaluate(() => localStorage.removeItem('theme'));
      await page.reload();

      const base = new BasePage(page, lang);
      const toggle = base.themeToggle();

      // Read the current aria-label BEFORE clicking.
      const before = await toggle.getAttribute('aria-label');
      expect(before, 'aria-label must be present before toggle').toBeTruthy();

      const switchToLight = t('common.switchToLight', lang);
      const switchToDark = t('common.switchToDark', lang);

      // Verify "before" is one of the two expected labels.
      expect(
        [switchToLight, switchToDark].includes(before ?? ''),
        `Expected initial aria-label to be one of ${JSON.stringify([switchToLight, switchToDark])}, got "${before}"`,
      ).toBe(true);

      // Compute the expected label AFTER the click — the opposite of "before".
      const expectedAfter = before === switchToLight ? switchToDark : switchToLight;

      // Click the toggle.
      await toggle.click();

      // Assert the label changed to the opposite string.
      await expect(toggle).toHaveAttribute('aria-label', expectedAfter);
    });
  }
});

// ── Skip-link text per locale ─────────────────────────────────────────────────

test.describe('Skip-link text', () => {
  for (const { path, lang } of locales) {
    test(`locale ${lang} (${path}): skip link has localized text`, async ({ page }) => {
      await page.goto(path);
      const base = new BasePage(page, lang);
      await expect(base.skipLink()).toHaveText(t('common.skipToContent', lang));
    });
  }
});
