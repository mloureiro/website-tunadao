import { test, expect, type Page } from '@playwright/test';
import { t } from './support/i18n';

const runningAnimations = (page: Page) =>
  page.evaluate(() => document.getAnimations().filter((a) => a.playState === 'running').length);

test.describe('not found page', () => {
  test('unknown root path answers 404 in Portuguese only', async ({ page }) => {
    const response = await page.goto('/does-not-exist/');

    expect(response?.status()).toBe(404);
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(t('notFound.heading', 'pt'));
    await expect(page.locator('html')).toHaveAttribute('lang', /^pt/);
    await expect(page.getByText(t('notFound.heading', 'en'))).toHaveCount(0);
  });

  test('the Portuguese home action returns to the Portuguese homepage', async ({ page }) => {
    await page.goto('/does-not-exist/');
    await page.getByRole('link', { name: t('notFound.home', 'pt') }).click();

    await expect(page).toHaveURL(/\/$/);
    await expect(page).not.toHaveURL(/\/en\//);
  });

  test('unknown English path renders the whole page in English and keeps the typed URL', async ({
    page,
  }) => {
    await page.goto('/en/does-not-exist/?x=1#y');

    await expect(page).toHaveURL(/\/en\/does-not-exist\/\?x=1#y$/);
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(t('notFound.heading', 'en'));
    await expect(page.locator('html')).toHaveAttribute('lang', /^en/);
    await expect(page).toHaveTitle(new RegExp(t('notFound.title', 'en')));
    await expect(
      page.getByRole('contentinfo').getByRole('link', { name: t('nav.about', 'en') })
    ).toBeVisible();
    await expect(page.locator('.lang-selector__current').first()).toHaveText(/EN/i);
    await expect(page.getByText(t('notFound.heading', 'pt'))).toHaveCount(0);
  });

  test('the English home action goes to the English homepage', async ({ page }) => {
    await page.goto('/en/does-not-exist/');
    await expect(page).toHaveURL(/\/en\/does-not-exist\/$/);
    await page.getByRole('link', { name: t('notFound.home', 'en') }).click();

    await expect(page).toHaveURL(/\/en\/$/);
  });

  test('reduced motion stops the needle', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'no-preference' });
    await page.goto('/does-not-exist/');
    await expect.poll(() => runningAnimations(page)).toBeGreaterThan(0);

    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/does-not-exist/');
    await expect.poll(() => runningAnimations(page)).toBe(0);
  });

  test('does not overflow horizontally at phone width', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 800 });

    for (const path of ['/does-not-exist/', '/en/does-not-exist/']) {
      await page.goto(path);
      await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
      const overflow = await page.evaluate(
        () => document.documentElement.scrollWidth - window.innerWidth
      );
      expect(overflow).toBeLessThanOrEqual(0);
    }
  });
});

test.describe('not found page without JavaScript', () => {
  test.use({ javaScriptEnabled: false });

  test('an English path still shows the complete Portuguese page', async ({ page }) => {
    await page.goto('/en/does-not-exist/');

    await expect(page.getByRole('heading', { level: 1 })).toHaveText(t('notFound.heading', 'pt'));
    await expect(page.getByRole('link', { name: t('notFound.home', 'pt') })).toBeVisible();
    await expect(
      page.getByRole('contentinfo').getByRole('link', { name: t('nav.about', 'pt') })
    ).toBeVisible();
  });
});
