import type { Page, Locator } from '@playwright/test';
import { BasePage } from './BasePage';
import type { Language } from '../support/i18n';

/**
 * Page object for the Contact page (`/contacto/` in PT, `/en/contacto/` in EN).
 *
 * Encapsulates the form locators and Turnstile/route-interception helpers.
 * The submit/interception logic is kept here so specs stay readable.
 */
export class ContactPage extends BasePage {
  constructor(page: Page, lang: Language = 'pt') {
    super(page, lang);
  }

  protected override path(): string {
    return this.lang === 'pt' ? '/contacto/' : '/en/contacto/';
  }

  // ── Form field locators ──────────────────────────────────────────────────

  form(): Locator {
    return this.page.locator('form#contactForm');
  }

  nameInput(): Locator {
    return this.page.locator('input#name');
  }

  emailInput(): Locator {
    return this.page.locator('input#email');
  }

  subjectSelect(): Locator {
    return this.page.locator('select#subject');
  }

  messageTextarea(): Locator {
    return this.page.locator('textarea#message');
  }

  submitButton(): Locator {
    return this.page.getByRole('button', { name: /enviar/i });
  }

  /** Success status element shown after a 2xx response from the backend. */
  successStatus(): Locator {
    return this.page.locator('.form-status.success');
  }

  /** Contact info card with email/phone/address details. */
  infoCard(): Locator {
    return this.page.locator('.info-card');
  }

  /** Social links block inside the info section. */
  socialLinks(): Locator {
    return this.page.locator('.info-social .social-links');
  }

  // ── Route-interception helpers ───────────────────────────────────────────

  /**
   * Intercept the Cloudflare Turnstile loader with a no-op stub.
   *
   * Must be called BEFORE page navigation so the intercept is in place when
   * the async `<script>` for Turnstile is fetched.  The stub exposes
   * `window.turnstile` (required by the form's reset() call) but does NOT
   * auto-inject a token — we inject the token explicitly via `injectTurnstileToken()`.
   */
  async interceptTurnstile(): Promise<void> {
    await this.page.route('**/turnstile/v0/api.js', (route) =>
      route.fulfill({
        status: 200,
        contentType: 'application/javascript',
        body: `window.turnstile = { render: () => {}, reset: () => {} };`,
      }),
    );
  }

  /**
   * Intercept the contact form POST and respond with a 201 success payload.
   *
   * Must be called BEFORE page navigation (or at least before form submit).
   * Uses a wildcard pattern so it matches regardless of what PUBLIC_CMS_URL
   * was set to at build time.
   */
  async interceptContactSubmission(): Promise<void> {
    await this.page.route('**/api/contact-submissions', (route) =>
      route.fulfill({
        status: 201,
        contentType: 'application/json',
        body: JSON.stringify({ doc: { id: 1 } }),
      }),
    );
  }

  /**
   * Inject a synthetic Turnstile token into the form.
   *
   * The form's submit handler gates on `cf-turnstile-response` being non-empty.
   * In headless CI the Cloudflare widget cannot auto-solve, so we inject a token
   * directly.  Since the POST is intercepted and no real server validates the token,
   * any non-empty string satisfies the guard.
   */
  async injectTurnstileToken(): Promise<void> {
    await this.page.evaluate(() => {
      const el = document.querySelector<HTMLInputElement>('[name="cf-turnstile-response"]');
      if (el) {
        el.value = 'test-token-e2e';
      } else {
        // Widget hasn't rendered the hidden input yet (stub intercepted api.js).
        // Create it so the form handler can read it.
        const input = document.createElement('input');
        input.type = 'hidden';
        input.name = 'cf-turnstile-response';
        input.value = 'test-token-e2e';
        document.getElementById('contactForm')?.appendChild(input);
      }
    });
  }

  /**
   * Navigate to the contact page with Turnstile and submission intercepted.
   *
   * Installs both route intercepts BEFORE navigation so the Turnstile async
   * script is caught on first load (eliminates the race condition that caused
   * intermittent failures when intercepts were added after page.goto).
   */
  async gotoWithIntercepts(): Promise<void> {
    await this.interceptTurnstile();
    await this.interceptContactSubmission();
    await this.goto();
  }
}
