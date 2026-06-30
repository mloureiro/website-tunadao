/**
 * E2E regression specs for interactive a11y behaviors.
 *
 * Covers findings: iym, j3d, h4ox, xdv, ocmz, oyz, zg9u, ogei (creu bead).
 * NOT covered: 1tj4 (decorative emoji — nothing observable, static-only fix).
 *
 * Activation strategy: ALL dialog-open steps use `locator.focus()` +
 * `keyboard.press('Enter')` (single fire, no retry loop). This is the only
 * reliable approach across all three browser engines:
 *  - Keyboard activation hits the button's own handler directly, regardless of
 *    whether a fullscreen overlay is present.
 *  - A `toPass()` re-click loop was removed because once the dialog opens, its
 *    fullscreen backdrop (position:fixed; inset:0; z-index:1000) intercepts
 *    subsequent pointer clicks and calls closeLightbox(), causing the dialog to
 *    oscillate open/closed and never settle.
 *  - WebKit does not focus `<button>` elements on pointer click, making keyboard
 *    activation necessary for cross-engine focus-restoration assertions anyway.
 *
 * Run stability check:
 *   npx playwright test e2e/a11y-interactive.spec.ts --repeat-each=5 --retries=0
 */

import { test, expect } from '@playwright/test';
import { VideosPage } from './pages/VideosPage';

// ── Lightbox dialog (findings: iym, h4ox-lightbox) ────────────────────────────

test.describe('Lightbox dialog — /citadao/2024', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/citadao/2024');
  });

  test('poster-button is present and enabled', async ({ page }) => {
    const trigger = page.locator('.poster-button');
    await expect(trigger).toBeEnabled();
  });

  test('poster button opens a dialog with role=dialog and aria-modal=true (keyboard activation)', async ({
    page,
  }) => {
    const trigger = page.locator('.poster-button');
    await expect(trigger).toBeEnabled();

    const dialog = page.locator('#poster-lightbox');

    // Open via keyboard: focus then Enter. Single fire — no retry loop.
    // Avoids the overlay-re-click oscillation (once open, the fullscreen backdrop
    // intercepts pointer events and closeLightbox() fires on each re-click).
    await trigger.focus();
    await page.keyboard.press('Enter');

    await expect(dialog).toHaveClass(/is-open/);
    await expect(dialog).toHaveAttribute('role', 'dialog');
    await expect(dialog).toHaveAttribute('aria-modal', 'true');
    await expect(dialog).toHaveAttribute('aria-hidden', 'false');
  });

  test('Escape closes the lightbox (keyboard activation)', async ({ page }) => {
    const trigger = page.locator('.poster-button');
    await expect(trigger).toBeEnabled();

    const dialog = page.locator('#poster-lightbox');

    // Open via keyboard activation (single fire — no retry loop).
    await trigger.focus();
    await page.keyboard.press('Enter');
    await expect(dialog).toHaveClass(/is-open/);

    await page.keyboard.press('Escape');

    await expect(dialog).not.toHaveClass(/is-open/);
    await expect(dialog).toHaveAttribute('aria-hidden', 'true');
  });

  test('Escape closes lightbox and focus returns to trigger (keyboard activation)', async ({
    page,
  }) => {
    // Use keyboard activation so the focus trap captures the trigger as restore target.
    // This is the real keyboard-user scenario (Tab to button, Enter to activate).
    const trigger = page.locator('.poster-button');
    await trigger.focus();
    await page.keyboard.press('Enter');

    const dialog = page.locator('#poster-lightbox');
    await expect(dialog).toHaveClass(/is-open/);

    await page.keyboard.press('Escape');

    await expect(dialog).not.toHaveClass(/is-open/);

    // Focus must return to the trigger button.
    await expect
      .poll(
        async () => {
          return page.evaluate(() => {
            const trigger = document.querySelector('.poster-button');
            return trigger ? trigger === document.activeElement : false;
          });
        },
        { timeout: 5000 },
      )
      .toBe(true);
  });

  test('Tab wraps focus into the lightbox when dialog is open (keyboard activation)', async ({
    page,
  }) => {
    const trigger = page.locator('.poster-button');
    await trigger.focus();
    await page.keyboard.press('Enter');

    const dialog = page.locator('#poster-lightbox');
    await expect(dialog).toHaveClass(/is-open/);

    // Wait for the CSS transition to finish (visibility:hidden → visible takes ~0.3s).
    // The focus trap's getFocusableElements() relies on offsetParent / getClientRects()
    // which return nothing while the element is still invisible mid-transition.
    // Waiting for the close button to be visible guarantees the transition is done
    // and Tab will find focusable elements to wrap to.
    const closeBtn = page.locator('.lightbox__close');
    await expect(closeBtn).toBeVisible();

    // The focus trap is active. Pressing Tab from outside the dialog wraps focus
    // to the first focusable element inside (#poster-lightbox close button).
    await page.keyboard.press('Tab');

    await expect
      .poll(
        async () => {
          return page.evaluate(() => {
            const container = document.getElementById('poster-lightbox');
            return container ? container.contains(document.activeElement) : false;
          });
        },
        { timeout: 3000 },
      )
      .toBe(true);
  });
});

// ── VideoModal dialog (findings: j3d, h4ox-videomodal) ────────────────────────

test.describe('VideoModal dialog — /videos/', () => {
  let videos: VideosPage;

  test.beforeEach(async ({ page }) => {
    videos = new VideosPage(page);
    await videos.goto();
  });

  test('at least one play button is present', async () => {
    await expect(videos.playButtons().first()).toBeVisible();
  });

  test('play button opens a dialog with role=dialog and aria-modal=true (keyboard activation)', async ({ page }) => {
    const firstPlay = videos.playButtons().first();
    const modal = videos.videoModal();

    // Open via keyboard activation (single fire — no retry loop).
    // Avoids the overlay-re-click oscillation: once the modal backdrop is visible
    // it intercepts pointer events and the close handler fires on each re-click.
    await firstPlay.focus();
    await page.keyboard.press('Enter');

    await expect(modal).toHaveClass(/active/);
    await expect(page.getByRole('dialog')).toBeVisible();
    await expect(modal).toHaveAttribute('aria-modal', 'true');
  });

  test('Escape closes the VideoModal (keyboard activation)', async ({ page }) => {
    const firstPlay = videos.playButtons().first();
    const modal = videos.videoModal();

    // Open via keyboard activation (single fire — no retry loop).
    await firstPlay.focus();
    await page.keyboard.press('Enter');
    await expect(modal).toHaveClass(/active/);

    await page.keyboard.press('Escape');

    await expect(modal).not.toHaveClass(/active/);
  });

  test('Escape closes VideoModal and focus returns to play button (keyboard activation)', async ({
    page,
  }) => {
    // Use keyboard activation for cross-browser focus restoration (see file header).
    const firstPlay = videos.playButtons().first();
    await firstPlay.focus();
    await page.keyboard.press('Enter');

    const modal = videos.videoModal();
    await expect(modal).toHaveClass(/active/);

    await page.keyboard.press('Escape');

    await expect(modal).not.toHaveClass(/active/);

    // Focus must return to the play button.
    await expect
      .poll(
        async () => {
          return page.evaluate(() => {
            const btn = document.querySelector('.video-card__play');
            return btn ? btn === document.activeElement : false;
          });
        },
        { timeout: 5000 },
      )
      .toBe(true);
  });

  test('Tab moves focus inside #videoModal while it is open (keyboard activation)', async ({
    page,
  }) => {
    const firstPlay = videos.playButtons().first();
    await firstPlay.focus();
    await page.keyboard.press('Enter');

    const modal = videos.videoModal();
    await expect(modal).toHaveClass(/active/);

    // The trap activates and moves focus to the close button inside the modal.
    await expect
      .poll(
        async () => {
          return page.evaluate(() => {
            const container = document.getElementById('videoModal');
            return container ? container.contains(document.activeElement) : false;
          });
        },
        { timeout: 5000 },
      )
      .toBe(true);
  });
});

// ── Mobile menu keyboard a11y (findings: xdv, ocmz) ──────────────────────────
// Scoped strictly to the `mobile` project — the menu button is display:none ≥1024px.

test.describe('Mobile menu keyboard a11y', () => {
  test('open/Escape cycle — aria-expanded toggles correctly', async ({ page }, testInfo) => {
    test.skip(
      testInfo.project.name !== 'mobile',
      'Mobile menu button is hidden on desktop viewports; this test is mobile-only.',
    );

    await page.goto('/');

    const menuBtn = page.locator('.header__menu-btn');
    const mobileMenu = page.locator('.header__mobile-menu');

    // Initial state: menu is closed.
    await expect(menuBtn).toHaveAttribute('aria-expanded', 'false');

    // Open the menu.
    await menuBtn.click();
    await expect(menuBtn).toHaveAttribute('aria-expanded', 'true');
    await expect(mobileMenu).toHaveAttribute('aria-hidden', 'false');

    // Escape closes the menu.
    await page.keyboard.press('Escape');
    await expect(menuBtn).toHaveAttribute('aria-expanded', 'false');
    await expect(mobileMenu).toHaveAttribute('aria-hidden', 'true');
  });

  test('Escape returns focus to the menu button (keyboard activation)', async ({
    page,
  }, testInfo) => {
    test.skip(
      testInfo.project.name !== 'mobile',
      'Mobile menu button is hidden on desktop viewports; this test is mobile-only.',
    );

    await page.goto('/');

    const menuBtn = page.locator('.header__menu-btn');
    const mobileMenu = page.locator('.header__mobile-menu');

    // Use keyboard activation so the focus trap captures the menu button as restore target.
    await menuBtn.focus();
    await page.keyboard.press('Enter');

    await expect(menuBtn).toHaveAttribute('aria-expanded', 'true');
    await expect(mobileMenu).toHaveAttribute('aria-hidden', 'false');

    await page.keyboard.press('Escape');
    await expect(menuBtn).toHaveAttribute('aria-expanded', 'false');

    // Focus must return to the toggle button.
    await expect
      .poll(
        async () => {
          return page.evaluate(() => {
            const btn = document.querySelector('.header__menu-btn');
            return btn ? btn === document.activeElement : false;
          });
        },
        { timeout: 5000 },
      )
      .toBe(true);
  });
});

// ── Active nav aria-current (finding: oyz) ────────────────────────────────────

test.describe('Active nav link aria-current', () => {
  test('desktop: active link has aria-current="page" on /citadao/', async ({
    page,
  }, testInfo) => {
    test.skip(
      testInfo.project.name === 'mobile',
      'Desktop nav is hidden on mobile; handled in the mobile block below.',
    );

    await page.goto('/citadao/');
    // The desktop nav link for Citadão must carry aria-current="page".
    // Use the stable BEM class — no locale strings.
    const activeDesktopLink = page.locator('.header__nav-link[aria-current="page"]');
    await expect(activeDesktopLink).toBeVisible();
  });

  test('mobile: active mobile nav link has aria-current="page" on /citadao/', async ({
    page,
  }, testInfo) => {
    test.skip(
      testInfo.project.name !== 'mobile',
      'Mobile nav link test is mobile-only.',
    );

    await page.goto('/citadao/');
    // The mobile nav link for Citadão must carry aria-current="page".
    const activeMobileLink = page.locator('.header__mobile-link[aria-current="page"]');
    await expect(activeMobileLink).toBeAttached();
  });
});

// ── CategoryFilter aria-pressed (finding: zg9u) ───────────────────────────────

test.describe('CategoryFilter aria-pressed — /videos/', () => {
  let videos: VideosPage;

  test.beforeEach(async ({ page }) => {
    videos = new VideosPage(page);
    await videos.goto();
  });

  test('first filter button has aria-pressed=true initially', async () => {
    const firstBtn = videos.filterButtons().first();
    await expect(firstBtn).toHaveAttribute('aria-pressed', 'true');
  });

  test('clicking a different filter sets aria-pressed correctly', async () => {
    const buttons = videos.filterButtons();
    const firstBtn = buttons.first();
    const secondBtn = buttons.nth(1);

    // Initially: first=true, second=false.
    await expect(firstBtn).toHaveAttribute('aria-pressed', 'true');
    await expect(secondBtn).toHaveAttribute('aria-pressed', 'false');

    // Click the second button.
    await secondBtn.click();

    // After click: second=true, first=false.
    await expect(secondBtn).toHaveAttribute('aria-pressed', 'true');
    await expect(firstBtn).toHaveAttribute('aria-pressed', 'false');
  });
});

// ── Reduced-motion scroll guard (finding: ogei) ───────────────────────────────

test.describe('Reduced-motion scroll guard', () => {
  test('scroll-behavior is auto when prefers-reduced-motion: reduce', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/');
    const scrollBehavior = await page.evaluate(() =>
      getComputedStyle(document.documentElement).scrollBehavior,
    );
    expect(scrollBehavior).toBe('auto');
  });
});
