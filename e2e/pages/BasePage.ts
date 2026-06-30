import type { Page, Locator } from '@playwright/test';
import type { Language } from '../support/i18n';

/**
 * Base page object — shared chrome locators used across all pages.
 *
 * Selector policy (per ITERATION_3.md):
 * - Prefer `getByRole` / `getByText`.
 * - Keep stable BEM hooks where roles are ambiguous.
 * - NO hardcoded locale strings (e.g. PT aria-labels "Navegação principal").
 */
export class BasePage {
  constructor(
    readonly page: Page,
    readonly lang: Language = 'pt',
  ) {}

  /** Navigate to the page's canonical URL. Subclasses override `path()`. */
  async goto(): Promise<void> {
    await this.page.goto(this.path());
  }

  /** Override in subclasses with the page's URL path. */
  protected path(): string {
    return '/';
  }

  // ── Chrome locators ──────────────────────────────────────────────────────

  /** The main `<nav>` element. Does NOT use the PT aria-label to stay locale-agnostic. */
  nav(): Locator {
    return this.page.getByRole('navigation').first();
  }

  /** Mobile hamburger button (visible on narrow viewports). */
  mobileMenuButton(): Locator {
    return this.page.locator('.header__menu-btn');
  }

  /** Language selector toggle button. */
  langButton(): Locator {
    return this.page.locator('.lang-selector__btn');
  }

  /**
   * Language option anchor for a given locale code.
   * Uses the `data-lang` attribute added to each option in LanguageSelector.astro.
   */
  langOption(code: Language): Locator {
    return this.page.locator(`[data-lang="${code}"]`);
  }

  /** The page footer element. */
  footer(): Locator {
    return this.page.locator('footer');
  }

  /** The primary `<h1>` heading. */
  heading(): Locator {
    return this.page.locator('h1');
  }

  /** Theme toggle button. */
  themeToggle(): Locator {
    return this.page.locator('.theme-toggle');
  }

  /** Skip link (first focusable in <body>). */
  skipLink(): Locator {
    return this.page.locator('a.skip-link');
  }
}
