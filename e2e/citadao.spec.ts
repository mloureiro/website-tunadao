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

  test('should display at least 2 edition cards (fixture-tied: editions 18 and 17)', async () => {
    // Fixture provides exactly 2 editions; assert >= 2 to stay count-tolerant
    // if the CMS dump ever adds more, this test still passes.
    const cards = citadao.editionCards();
    await expect(cards.first()).toBeVisible();
    const count = await cards.count();
    expect(count).toBeGreaterThanOrEqual(2);
  });

  test('should contain a card for the 18th edition (fixture: 2024)', async () => {
    // The EditionCard renders "{number}ª Edição CITADÃO" — assert "18" is present.
    const card18 = citadao.editionByTitle('18');
    await expect(card18).toBeVisible();
    // Also assert the full heading text contains CITADÃO
    await expect(card18.locator('h3')).toContainText('CITADÃO');
  });

  test('should contain a card for the 17th edition (fixture: 2023)', async () => {
    // The EditionCard renders "{number}ª Edição CITADÃO" — assert "17" is present.
    const card17 = citadao.editionByTitle('17');
    await expect(card17).toBeVisible();
    await expect(card17.locator('h3')).toContainText('CITADÃO');
  });

  test('should navigate to the edition detail page via edition-link', async ({ page }) => {
    // Click the first edition-link (edition 18, year 2024 from fixture).
    await citadao.editionLinks().first().click();
    // The detail route is /citadao/{year} — must match year 2024 or 2023.
    await expect(page).toHaveURL(/\/citadao\/\d{4}\/?$/);
    // The detail page h1 contains "CITADÃO {year}" — verify it rendered.
    await expect(page.locator('h1')).toContainText('CITADÃO');
  });
});

test.describe('Citadão — fixture-tied participant names', () => {
  test('should render participant tuna name EUL on the 2023 detail page', async ({ page }) => {
    // Fixture: edition 2 (XVII, 2023) has EUL as contestant.
    await page.goto('/citadao/2023');
    // The tuna name is rendered as <p class="tuna-name">EUL</p>
    await expect(page.locator('.tuna-name', { hasText: 'EUL' })).toBeVisible();
  });

  test('should render participant tuna name Afonsina on the 2024 detail page', async ({ page }) => {
    // Fixture: edition 1 (XVIII, 2024) has Afonsina as award winner (Melhor Tuna).
    await page.goto('/citadao/2024');
    await expect(page.locator('.tuna-name', { hasText: 'Afonsina' })).toBeVisible();
  });
});
