import { test, expect } from '@playwright/test';

test('wakes the CMS once on load and not again when navigating within the tab', async ({
  page,
}) => {
  let hits = 0;
  await page.route('**/api/globals/site-settings*', async (route) => {
    hits += 1;
    await route.fulfill({ status: 200, contentType: 'application/json', body: '{}' });
  });

  await page.goto('/');
  await expect.poll(() => hits).toBe(1);

  await page.goto('/sobre/');
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  expect(hits).toBe(1);
});
