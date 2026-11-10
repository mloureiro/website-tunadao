import { test, expect } from '@playwright/test';
import { t } from './support/i18n';

test.describe('not found page', () => {
  test('answers 404 with the Portuguese title and a noindex robots tag', async ({ page }) => {
    const response = await page.goto('/does-not-exist/');

    expect(response?.status()).toBe(404);
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(t('notFound.title', 'pt'));
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', /noindex/);
    await expect(page.locator('link[rel="canonical"]')).toHaveCount(0);
  });

  test('the home link returns to the Portuguese homepage', async ({ page }) => {
    await page.goto('/does-not-exist/');
    await page.getByRole('link', { name: t('notFound.home', 'pt') }).click();

    await expect(page).toHaveURL(/\/$/);
    await expect(page).not.toHaveURL(/\/en\//);
  });

  test('the English link lands on the English homepage', async ({ page }) => {
    await page.goto('/does-not-exist/');
    await page.getByRole('link', { name: t('notFound.home', 'en') }).click();

    await expect(page).toHaveURL(/\/en\/$/);
  });

  test('an unknown English path renders the same page', async ({ page }) => {
    const response = await page.goto('/en/does-not-exist/');

    expect(response?.status()).toBe(404);
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(t('notFound.title', 'pt'));
  });

  test('does not overflow horizontally at phone width', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 800 });
    await page.goto('/does-not-exist/');

    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - window.innerWidth
    );
    expect(overflow).toBeLessThanOrEqual(0);
  });
});
