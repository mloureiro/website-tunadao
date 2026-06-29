import type { Page, Locator } from '@playwright/test';
import { BasePage } from './BasePage';
import type { Language } from '../support/i18n';

/**
 * Page object for the Citadão page (`/citadao/` in PT, `/en/citadao/` in EN).
 */
export class CitadaoPage extends BasePage {
  constructor(page: Page, lang: Language = 'pt') {
    super(page, lang);
  }

  protected override path(): string {
    return this.lang === 'pt' ? '/citadao/' : '/en/citadao/';
  }

  // ── Edition locators ─────────────────────────────────────────────────────

  /** All edition cards on the listing page. */
  editionCards(): Locator {
    return this.page.locator('.edition-card');
  }

  /** All edition detail links. */
  editionLinks(): Locator {
    return this.page.locator('.edition-link');
  }

  /**
   * An edition card whose heading contains the given title substring.
   * Uses case-insensitive text match to stay fixture-stable.
   */
  editionByTitle(titleSubstr: string): Locator {
    return this.page.locator('.edition-card', { hasText: titleSubstr });
  }
}
