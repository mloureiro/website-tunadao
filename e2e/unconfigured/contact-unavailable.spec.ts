import { test, expect } from '@playwright/test';
import { ContactPage } from '../pages/ContactPage';
import { t, type Language } from '../support/i18n';

const FIXTURE_EMAIL = 'tunadao@gmail.com';

const locales: Language[] = ['pt', 'en'];

for (const lang of locales) {
  test(`contact page shows the unavailable state with the email instead of a form (${lang})`, async ({
    page,
  }) => {
    const pageErrors: Error[] = [];
    page.on('pageerror', (error) => pageErrors.push(error));

    const contact = new ContactPage(page, lang);
    await contact.goto();

    const title = t('contact.unavailable.title', lang);
    const region = page.getByRole('region', { name: title });
    await expect(region).toBeVisible();
    await expect(region.getByRole('heading', { name: title })).toBeVisible();
    await expect(region).toContainText(t('contact.unavailable.message', lang));

    const emailLink = region.getByRole('link', { name: FIXTURE_EMAIL });
    await expect(emailLink).toHaveAttribute('href', `mailto:${FIXTURE_EMAIL}`);

    await expect(contact.form()).toHaveCount(0);
    await expect(page.locator('.cf-turnstile')).toHaveCount(0);
    expect(pageErrors).toEqual([]);
  });
}
