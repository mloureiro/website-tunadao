import { test, expect } from '@playwright/test';
import { ContactPage } from './pages/ContactPage';

test.describe('Contact Page', () => {
  let contact: ContactPage;

  test.beforeEach(async ({ page }) => {
    contact = new ContactPage(page);
    await contact.goto();
  });

  test('should display contact form', async () => {
    await expect(contact.form()).toBeVisible();
  });

  test('should have required form fields', async () => {
    await expect(contact.nameInput()).toBeVisible();
    await expect(contact.emailInput()).toBeVisible();
    await expect(contact.subjectSelect()).toBeVisible();
    await expect(contact.messageTextarea()).toBeVisible();
  });

  test('should have contact information', async () => {
    await expect(contact.infoCard()).toBeVisible();
    // Check for email and phone info items
    await expect(contact.infoCard().locator('.info-item')).toHaveCount(3);
  });

  test('should have social links', async () => {
    await expect(contact.socialLinks()).toBeVisible();
  });

  test('should validate required fields', async () => {
    // Try to submit empty form
    await contact.submitButton().click();

    // Check that form is not submitted (still on same page)
    await expect(contact.page).toHaveURL('/contacto/');
  });

  test('should fill and submit form', async ({ page }) => {
    // Re-create the page object for this test, using gotoWithIntercepts() to
    // install route intercepts BEFORE navigation.  This is the key fix for
    // deterministic behaviour across all 3 browsers:
    //
    // ROOT CAUSE of the previous flakiness:
    //   The Turnstile script is loaded via `<script async defer>`, meaning the
    //   browser can fetch it during or right after page load.  When intercepts
    //   were installed AFTER page.goto() (as in the old flat spec), a race
    //   condition allowed the real CDN request to fire before Playwright's route
    //   handler was registered — especially on Firefox and WebKit/mobile where
    //   script scheduling differs from Chromium.  The live Turnstile then failed
    //   to complete in headless CI, the token was never written, and the form's
    //   empty-token guard triggered an error state.
    //
    // FIX: install both route intercepts before navigation so they are active
    //   from the very first network request the page makes.
    const freshContact = new ContactPage(page);
    await freshContact.gotoWithIntercepts();

    await freshContact.nameInput().fill('Test User');
    await freshContact.emailInput().fill('test@example.com');
    await freshContact.subjectSelect().selectOption('informacao');
    await freshContact.messageTextarea().fill('This is a test message');

    // Inject a synthetic Turnstile token before submit.
    // The form handler gates on cf-turnstile-response being non-empty; since
    // the POST is intercepted (no real server validates the token), any
    // non-empty string satisfies the guard.
    await freshContact.injectTurnstileToken();

    await freshContact.submitButton().click();

    // Web-first assertion: auto-waits for the success status to appear.
    // No waitForTimeout needed — the element appears when the intercepted
    // fetch resolves (synchronously in Playwright's route handler).
    await expect(freshContact.successStatus()).toBeVisible();
  });
});
