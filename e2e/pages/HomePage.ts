import type { Page, Locator } from '@playwright/test';
import { BasePage } from './BasePage';
import type { Language } from '../support/i18n';

/**
 * Page object for the Homepage (`/` in PT, `/en/` in EN).
 */
export class HomePage extends BasePage {
  constructor(page: Page, lang: Language = 'pt') {
    super(page, lang);
  }

  protected override path(): string {
    return this.lang === 'pt' ? '/' : '/en/';
  }

  // ── Section locators ────────────────────────────────────────────────────

  sobrePreview(): Locator {
    return this.page.locator('#sobre-preview');
  }

  citadaoPreview(): Locator {
    return this.page.locator('#citadao-preview');
  }

  palmaresPreview(): Locator {
    return this.page.locator('#palmares-preview');
  }

  musicCta(): Locator {
    return this.page.locator('#music-cta');
  }

  /** The main stats bar container (first one on the page, the top-level hero bar). */
  statsBar(): Locator {
    return this.page.locator('.stats-bar').first();
  }

  /** Individual stats items scoped to the main stats bar. */
  statsItems(): Locator {
    return this.statsBar().locator('.stats-bar__item');
  }

  /** The section-image link inside #sobre-preview that navigates to the Sobre page. */
  sobreLink(): Locator {
    return this.page.locator('#sobre-preview .section-image a');
  }

  /** The section-image link inside #citadao-preview that navigates to the Citadão page. */
  citadaoLink(): Locator {
    return this.page.locator('#citadao-preview .section-image a');
  }

  /** The section-image link inside #palmares-preview that navigates to the Palmarés page. */
  palmaresLink(): Locator {
    return this.page.locator('#palmares-preview .section-image a');
  }
}
