/**
 * E2E regression spec for the VerticalTimeline mobile year-indicator chevron rotation.
 *
 * Covers bug 8mzx: the chevron icon in the mobile year-indicator never rotated when
 * the dropdown was opened, because the sibling combinator used to select the icon was
 * broken. The fix uses `.year-indicator:has(.year-indicator__dropdown--open) .year-indicator__icon`.
 *
 * Component: VerticalTimeline.astro → .year-indicator (mobile floating button)
 * Pages with VerticalTimeline: /citadao/ and /palmares/
 * Breakpoint: below 1200px → mobile year-indicator rendered, desktop timeline hidden
 *
 * Activation strategy:
 *  - The year-indicator starts hidden (opacity:0; pointer-events:none) and becomes
 *    interactive only after `.year-indicator--visible` is toggled by IntersectionObserver
 *    when the editions section enters the viewport.
 *  - We scroll the editions section into view, then wait for pointer-events to become
 *    auto before clicking.
 *  - Chevron transform is polled via `expect.poll` to account for the CSS transition.
 *
 * Run stability check:
 *   npx playwright test e2e/year-indicator.spec.ts --repeat-each=5 --retries=0
 */

import { test, expect } from '@playwright/test';

// ── Helper: identity transform values returned by getComputedStyle ─────────────
// rotate(180deg) → matrix(-1, 0, 0, -1, 0, 0)
const IDENTITY_TRANSFORMS = new Set(['none', 'matrix(1, 0, 0, 1, 0, 0)']);
const ROTATED_MATRIX = 'matrix(-1, 0, 0, -1, 0, 0)';

// ── Helper: make year-indicator visible by scrolling sections into view ────────
async function triggerYearIndicatorVisibility(page: import('@playwright/test').Page): Promise<void> {
  // Scroll the editions section into viewport to fire IntersectionObserver
  // which toggles .year-indicator--visible (opacity:1; pointer-events:auto).
  const editionsSection = page.locator('#editions-section');
  await editionsSection.scrollIntoViewIfNeeded();

  // Wait until the year-indicator has pointer-events:auto (--visible class applied)
  await expect.poll(
    async () => {
      return page.evaluate(() => {
        const el = document.querySelector('.year-indicator');
        return el ? getComputedStyle(el).pointerEvents : 'none';
      });
    },
    { timeout: 5000 },
  ).toBe('auto');
}

// ── Chevron rotation — mobile project only ────────────────────────────────────
// The .year-indicator is display:none at ≥1200px (desktop). This test is only
// meaningful on the mobile project (iPhone 13, 390px).

test.describe('Year indicator chevron rotation — /citadao/ (mobile only)', () => {
  test('chevron is not rotated before dropdown opens', async ({ page }, testInfo) => {
    test.skip(
      testInfo.project.name !== 'mobile',
      'Year indicator is display:none above 1200px; this test is mobile-only.',
    );

    await page.goto('/citadao/');
    await triggerYearIndicatorVisibility(page);

    const icon = page.locator('.year-indicator__icon');

    // Before any interaction, the icon must have an identity transform (not rotated).
    const initialTransform = await page.evaluate(() => {
      const el = document.querySelector('.year-indicator__icon');
      return el ? getComputedStyle(el).transform : null;
    });

    expect(initialTransform).not.toBeNull();
    expect(IDENTITY_TRANSFORMS.has(initialTransform!)).toBe(true);

    // Sanity: dropdown is not open
    await expect(page.locator('.year-indicator__dropdown--open')).not.toBeAttached();

    // Icon is visible (within the visible indicator)
    await expect(icon).toBeAttached();
  });

  test('chevron rotates to 180deg after opening the dropdown', async ({ page }, testInfo) => {
    test.skip(
      testInfo.project.name !== 'mobile',
      'Year indicator is display:none above 1200px; this test is mobile-only.',
    );

    await page.goto('/citadao/');
    await triggerYearIndicatorVisibility(page);

    const button = page.locator('.year-indicator__button');
    const dropdown = page.locator('.year-indicator__dropdown');

    // Click to open the dropdown
    await button.click();

    // Dropdown must have the --open modifier class
    await expect(dropdown).toHaveClass(/year-indicator__dropdown--open/);

    // Poll until the CSS transition settles to the rotated matrix.
    // rotate(180deg) resolves to matrix(-1, 0, 0, -1, 0, 0).
    await expect.poll(
      async () => {
        return page.evaluate(() => {
          const el = document.querySelector('.year-indicator__icon');
          return el ? getComputedStyle(el).transform : null;
        });
      },
      { timeout: 2000 },
    ).toBe(ROTATED_MATRIX);
  });

  test('chevron returns to identity transform after closing the dropdown', async ({ page }, testInfo) => {
    test.skip(
      testInfo.project.name !== 'mobile',
      'Year indicator is display:none above 1200px; this test is mobile-only.',
    );

    await page.goto('/citadao/');
    await triggerYearIndicatorVisibility(page);

    const button = page.locator('.year-indicator__button');
    const dropdown = page.locator('.year-indicator__dropdown');

    // Open the dropdown
    await button.click();
    await expect(dropdown).toHaveClass(/year-indicator__dropdown--open/);

    // Wait for open rotation to settle
    await expect.poll(
      async () => {
        return page.evaluate(() => {
          const el = document.querySelector('.year-indicator__icon');
          return el ? getComputedStyle(el).transform : null;
        });
      },
      { timeout: 2000 },
    ).toBe(ROTATED_MATRIX);

    // Close the dropdown by clicking the button again
    await button.click();
    await expect(dropdown).not.toHaveClass(/year-indicator__dropdown--open/);

    // Poll until the icon returns to identity transform.
    // We check both known identity values: 'none' and 'matrix(1, 0, 0, 1, 0, 0)'.
    await expect.poll(
      async () => {
        const t = await page.evaluate(() => {
          const el = document.querySelector('.year-indicator__icon');
          return el ? getComputedStyle(el).transform : null;
        });
        return IDENTITY_TRANSFORMS.has(t ?? '');
      },
      { timeout: 2000 },
    ).toBe(true);
  });
});

// ── Desktop projects: year-indicator must be absent / not interactive ──────────

test.describe('Year indicator hidden on desktop viewports', () => {
  test('year-indicator is not interactive (display:none) above 1200px', async ({ page }, testInfo) => {
    test.skip(
      testInfo.project.name === 'mobile',
      'Desktop-only check; mobile is covered by the rotation tests above.',
    );

    await page.goto('/citadao/');

    // Wait for page to settle
    await expect(page.locator('h1')).toContainText('Citadão');

    const isHidden = await page.evaluate(() => {
      const el = document.querySelector('.year-indicator');
      if (!el) return true;
      return getComputedStyle(el).display === 'none';
    });

    expect(isHidden).toBe(true);
  });
});
