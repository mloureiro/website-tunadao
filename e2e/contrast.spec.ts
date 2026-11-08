import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

const FIXED_COMPONENTS = [
  '.section-divider__label',
  '.stats-bar--inline',
  '.btn',
  '.mission',
  '.timeline',
  '.hierarchy',
  '.palmares',
  '.hero[aria-labelledby="edition-title"]',
  '.spotify-cta',
  '.edition-cta',
  '.nav-link',
  '.album-card__year',
  '#pending-title',
  '.section-title',
];

const ROUTES = [
  '/',
  '/sobre',
  '/citadao',
  '/citadao/2024',
  '/citadao/2025',
  '/palmares',
  '/musica',
  '/en/',
];
const THEMES = ['light', 'dark'] as const;

test.describe('text contrast on fixed components', () => {
  test.skip(({ browserName }) => browserName !== 'chromium', 'axe contrast runs on Chromium only');
  test.use({ reducedMotion: 'reduce' });

  for (const route of ROUTES) {
    for (const theme of THEMES) {
      test(`${route} meets AA contrast in ${theme} theme`, async ({ page }) => {
        await page.addInitScript((value) => localStorage.setItem('theme', value), theme);
        await page.goto(route);
        await expect(page.locator('html')).toHaveAttribute('data-theme', theme);
        await page.evaluate(() => document.fonts.ready);
        await page.evaluate(() => {
          for (const animation of document.getAnimations()) {
            try {
              animation.finish();
            } catch {
              animation.cancel();
            }
          }
        });

        const present: string[] = [];
        for (const selector of FIXED_COMPONENTS) {
          if ((await page.locator(selector).count()) > 0) present.push(selector);
        }
        const scope = present.length > 0 ? present : ['main'];

        const builder = new AxeBuilder({ page }).withRules(['color-contrast']);
        for (const selector of scope) builder.include(selector);
        const results = await builder.analyze();

        const report = results.violations.flatMap((violation) =>
          violation.nodes.map((node) => {
            const data = node.any[0]?.data as
              | { fgColor?: string; bgColor?: string; contrastRatio?: number }
              | undefined;
            return `${node.target.join(' ')} fg=${data?.fgColor} bg=${data?.bgColor} ratio=${data?.contrastRatio}`;
          })
        );
        expect(report, report.join('\n')).toEqual([]);
      });
    }
  }
});
