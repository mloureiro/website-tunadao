import { test, expect } from '@playwright/test';
import { t, type Language } from '../support/i18n';

const locales: { lang: Language; path: string }[] = [
  { lang: 'pt', path: '/musica/' },
  { lang: 'en', path: '/en/musica/' },
];

for (const { lang, path } of locales) {
  test(`music page shows the empty-albums message instead of an empty grid (${lang})`, async ({
    page,
  }) => {
    await page.goto(path);

    await expect(page.getByRole('heading', { name: t('music.albums', lang) })).toBeVisible();
    await expect(page.getByText(t('music.albumsEmpty', lang))).toBeVisible();
    await expect(page.locator('.albums__grid')).toHaveCount(0);
  });
}
