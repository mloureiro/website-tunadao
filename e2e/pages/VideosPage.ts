import type { Page, Locator } from '@playwright/test';
import { BasePage } from './BasePage';
import type { Language } from '../support/i18n';

/**
 * Page object for the Videos page (`/videos/` in PT, `/en/videos/` in EN).
 *
 * Selector policy: stable BEM class hooks; no hardcoded locale strings.
 */
export class VideosPage extends BasePage {
  constructor(page: Page, lang: Language = 'pt') {
    super(page, lang);
  }

  protected override path(): string {
    return this.lang === 'pt' ? '/videos/' : '/en/videos/';
  }

  // ── Video card locators ──────────────────────────────────────────────────

  /** All play buttons on the video cards. */
  playButtons(): Locator {
    return this.page.locator('.video-card__play');
  }

  // ── Modal locators ───────────────────────────────────────────────────────

  /** The VideoModal container element (`#videoModal`). */
  videoModal(): Locator {
    return this.page.locator('#videoModal');
  }

  /** The modal close button. */
  modalClose(): Locator {
    return this.page.locator('.video-modal__close');
  }

  // ── Filter locators ──────────────────────────────────────────────────────

  /** All category filter buttons. */
  filterButtons(): Locator {
    return this.page.locator('.category-filter__btn');
  }

  /**
   * A single filter button by visible text label.
   * Accepts a string or regex for flexible matching.
   */
  filterButtonByText(label: string | RegExp): Locator {
    return this.page.locator('.category-filter__btn', { hasText: label });
  }
}
