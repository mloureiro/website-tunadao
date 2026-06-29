import { test, expect } from '@playwright/test';
import { CitadaoPage } from './pages/CitadaoPage';

test.describe('Citadão Page', () => {
  let citadao: CitadaoPage;

  test.beforeEach(async ({ page }) => {
    citadao = new CitadaoPage(page);
    await citadao.goto();
  });

  test('should display the main title', async () => {
    await expect(citadao.heading()).toContainText('Citadão');
  });

  test('should display editions list', async () => {
    await expect(citadao.editionCards().first()).toBeVisible();
  });

  test('should display edition information', async () => {
    const editionCard = citadao.editionCards().first();
    await expect(editionCard).toBeVisible();
    await expect(editionCard.locator('h3')).toContainText('CITADÃO');
  });

  test('should navigate to edition detail page', async () => {
    await expect(citadao.editionLinks().first()).toBeVisible();
  });
});
