import { test, expect } from '@playwright/test';

test.describe('Contact Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/contacto/');
  });

  test('should display contact form', async ({ page }) => {
    const form = page.locator('form#contactForm');
    await expect(form).toBeVisible();
  });

  test('should have required form fields', async ({ page }) => {
    await expect(page.locator('input#name')).toBeVisible();
    await expect(page.locator('input#email')).toBeVisible();
    await expect(page.locator('select#subject')).toBeVisible();
    await expect(page.locator('textarea#message')).toBeVisible();
  });

  test('should have contact information', async ({ page }) => {
    const infoCard = page.locator('.info-card');
    await expect(infoCard).toBeVisible();
    // Check for email and phone info items
    await expect(infoCard.locator('.info-item')).toHaveCount(3);
  });

  test('should have social links', async ({ page }) => {
    const socialLinks = page.locator('.info-social .social-links');
    await expect(socialLinks).toBeVisible();
  });

  test('should validate required fields', async ({ page }) => {
    // Try to submit empty form
    await page.getByRole('button', { name: /enviar/i }).click();

    // Check that form is not submitted (still on same page)
    await expect(page).toHaveURL('/contacto/');
  });

  test('should fill and submit form', async ({ page }) => {
    // Intercept the CMS POST so the test passes without a live backend.
    // The form script POSTs to ${PUBLIC_CMS_URL}/api/contact-submissions;
    // the wildcard pattern matches regardless of what PUBLIC_CMS_URL is built with.
    await page.route('**/api/contact-submissions', (route) =>
      route.fulfill({
        status: 201,
        contentType: 'application/json',
        body: JSON.stringify({ doc: { id: 1 } }),
      }),
    );

    await page.locator('input#name').fill('Test User');
    await page.locator('input#email').fill('test@example.com');
    await page.locator('select#subject').selectOption('informacao');
    await page.locator('textarea#message').fill('This is a test message');

    await page.getByRole('button', { name: /enviar/i }).click();

    // Wait for success message rendered by the form handler on a 2xx response.
    await expect(page.locator('.form-status.success')).toBeVisible({ timeout: 5000 });
  });
});
