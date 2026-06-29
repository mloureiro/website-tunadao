/**
 * i18n / EN routes + language switching
 *
 * Findings: km0p (EN routes coverage) + 254s (locale-aware accessors, no hardcoded PT strings)
 *
 * Route scheme (prefixDefaultLocale: false):
 *   PT → /           (no prefix)
 *   EN → /en/        (explicit prefix)
 *
 * All assertions use t(key, lang) from the app's i18n helper — zero hardcoded
 * locale strings in this file.
 *
 * Mobile-safe strategy: footer navigation links are always visible (not hidden
 * behind the mobile hamburger menu like the desktop header nav).
 */
import { test, expect } from '@playwright/test';
import { HomePage } from './pages/HomePage';
import { t } from './support/i18n';

// ── Helpers ───────────────────────────────────────────────────────────────────

/**
 * Locale-aware nav label for "About Us" — differs between PT and EN.
 * PT: "Sobre Nós"  EN: "About Us"
 */
function navAboutLabel(lang: 'pt' | 'en'): string {
  return t('nav.about', lang);
}

/**
 * Locale-aware hero subtitle (`home.subtitle`): always rendered in the hero
 * section, visible on every viewport size.
 * PT: "Tuna do Instituto Politécnico de Viseu"
 * EN: "Tuna of the Polytechnic Institute of Viseu"
 */
function homeSubtitle(lang: 'pt' | 'en'): string {
  return t('home.subtitle', lang);
}

// ── PT / EN chrome rendering ──────────────────────────────────────────────────

test.describe('Locale chrome — PT vs EN', () => {
  test('PT root (/) renders PT nav label for About in footer', async ({ page }) => {
    const home = new HomePage(page, 'pt');
    await home.goto();

    const ptLabel = navAboutLabel('pt');
    const enLabel = navAboutLabel('en');

    // Sanity-check: labels must differ so the test is meaningful
    expect(ptLabel).not.toBe(enLabel);

    // Footer nav links are always visible (no mobile hamburger gate)
    await expect(page.locator('footer .footer__link', { hasText: ptLabel })).toBeVisible();
  });

  test('EN root (/en/) renders EN nav label for About in footer', async ({ page }) => {
    const home = new HomePage(page, 'en');
    await home.goto();

    const enLabel = navAboutLabel('en');

    // Footer nav links are always visible
    await expect(page.locator('footer .footer__link', { hasText: enLabel })).toBeVisible();
  });

  test('PT root (/) renders PT subtitle in hero', async ({ page }) => {
    const home = new HomePage(page, 'pt');
    await home.goto();

    const ptSubtitle = homeSubtitle('pt');
    // The hero subtitle is always rendered in the page, visible on all viewports
    await expect(page.getByText(ptSubtitle, { exact: true }).first()).toBeAttached();
  });

  test('EN root (/en/) renders EN subtitle in hero', async ({ page }) => {
    const home = new HomePage(page, 'en');
    await home.goto();

    const enSubtitle = homeSubtitle('en');
    await expect(page.getByText(enSubtitle, { exact: true }).first()).toBeAttached();
  });
});

// ── Language switcher: PT → EN ────────────────────────────────────────────────

test.describe('Language switcher', () => {
  test('switching from PT (/) to EN navigates to /en/... URL', async ({ page }) => {
    const home = new HomePage(page, 'pt');
    await home.goto();

    // Open the language selector dropdown (button is always visible on all viewports)
    await home.langButton().click();

    // Wait for the EN option to become visible (JS-toggled dropdown)
    const enOption = home.langOption('en');
    await expect(enOption).toBeVisible();
    await enOption.click();

    // URL must now contain /en/
    await expect(page).toHaveURL(/\/en\//);

    // Verify EN chrome: footer "About Us" link visible
    const enLabel = navAboutLabel('en');
    await expect(page.locator('footer .footer__link', { hasText: enLabel })).toBeVisible();
  });

  test('switching from EN (/en/) to PT navigates to PT URL (no /en/ prefix)', async ({
    page,
  }) => {
    const home = new HomePage(page, 'en');
    await home.goto();

    // Open the language selector dropdown
    await home.langButton().click();

    // Wait for the PT option to become visible
    const ptOption = home.langOption('pt');
    await expect(ptOption).toBeVisible();
    await ptOption.click();

    // URL must NOT start with /en/
    await expect(page).not.toHaveURL(/\/en\//);

    // Verify PT chrome: footer "Sobre Nós" link visible
    const ptLabel = navAboutLabel('pt');
    await expect(page.locator('footer .footer__link', { hasText: ptLabel })).toBeVisible();
  });
});

// ── EN sub-routes ─────────────────────────────────────────────────────────────

test.describe('EN sub-routes', () => {
  test('/en/citadao renders Citadão page in EN chrome', async ({ page }) => {
    await page.goto('/en/citadao/');
    // h1 stays "Citadão" in both locales (same key value)
    await expect(page.locator('h1')).toContainText(t('citadao.title', 'en'));
    // EN footer link for About ("About Us") is visible
    const enAbout = navAboutLabel('en');
    await expect(page.locator('footer .footer__link', { hasText: enAbout })).toBeVisible();
  });
});
