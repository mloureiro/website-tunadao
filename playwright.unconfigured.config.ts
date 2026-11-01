import { defineConfig, devices } from '@playwright/test';
import baseConfig from './playwright.config';

export default defineConfig({
  ...baseConfig,
  testDir: './e2e/unconfigured',
  testIgnore: undefined,
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
});
