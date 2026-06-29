import { test, expect } from '@playwright/test';
import { HomePage } from './pages/HomePage';

test.describe('Homepage', () => {
  let home: HomePage;

  test.beforeEach(async ({ page }) => {
    home = new HomePage(page);
    await home.goto();
  });

  test('should display the main title', async () => {
    await expect(home.heading()).toContainText('Tunadão 1998');
  });

  test('should have navigation', async ({ isMobile }) => {
    if (isMobile) {
      // On mobile, desktop nav is hidden — only the hamburger button is visible.
      await expect(home.mobileMenuButton()).toBeVisible();
    } else {
      // On desktop, the main <nav> element is attached (may be display:none on
      // narrower breakpoints, but the element is in the DOM).
      await expect(home.nav()).toBeAttached();
    }
  });

  test('should have footer', async () => {
    await expect(home.footer()).toBeVisible();
  });

  test('should have skip to content link for accessibility', async ({ page }) => {
    // Locate by stable class + href rather than a hardcoded locale-specific label.
    const skipLink = page.locator('a.skip-link[href="#main-content"]');
    await expect(skipLink).toBeAttached();
  });

  test('should have stats bar', async () => {
    await expect(home.statsBar()).toBeVisible();
    await expect(home.statsItems()).toHaveCount(5);
  });

  test('should have section links to main pages', async () => {
    await expect(home.sobrePreview()).toBeAttached();
    await expect(home.citadaoPreview()).toBeAttached();
    await expect(home.palmaresPreview()).toBeAttached();
    await expect(home.musicCta()).toBeAttached();
  });
});

test.describe('Navigation via section images', () => {
  test('should navigate to Sobre page via section image', async ({ page }) => {
    const home = new HomePage(page);
    await home.goto();
    await home.sobreLink().click();
    await expect(page).toHaveURL(/\/sobre\/?$/);
    await expect(page.locator('h1')).toContainText('Sobre Nós');
  });

  test('should navigate to Citadão page via section image', async ({ page }) => {
    const home = new HomePage(page);
    await home.goto();
    await home.citadaoLink().click();
    await expect(page).toHaveURL(/\/citadao\/?$/);
    await expect(page.locator('h1')).toContainText('Citadão');
  });

  test('should navigate to Palmarés page via section image', async ({ page }) => {
    const home = new HomePage(page);
    await home.goto();
    await home.palmaresLink().click();
    await expect(page).toHaveURL(/\/palmares\/?$/);
    await expect(page.locator('h1')).toContainText('Palmarés');
  });
});
