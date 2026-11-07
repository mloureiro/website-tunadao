import { test, expect } from '@playwright/test';

test('sends no CMS request and raises no errors when the CMS is not configured', async ({
  page,
}) => {
  const requestUrls: string[] = [];
  const pageErrors: Error[] = [];
  page.on('request', (request) => requestUrls.push(request.url()));
  page.on('pageerror', (error) => pageErrors.push(error));

  await page.goto('/');
  await page.waitForLoadState('networkidle');

  expect(requestUrls.filter((url) => url.includes('/api/'))).toEqual([]);
  expect(pageErrors).toEqual([]);
});
