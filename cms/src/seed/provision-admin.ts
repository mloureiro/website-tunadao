// Load environment FIRST before any other imports
import 'dotenv/config';
import { config as dotenvConfig } from 'dotenv';
dotenvConfig({ path: '.env.local', override: true });

import { LOCAL_DB_URL } from '../lib/db-path';

/**
 * Returns scheme + host of the given URL (credentials, query, and fragment redacted).
 * For file: URLs, returns scheme + path.
 * Falls back to '<unparseable url — host hidden>' if parsing fails.
 */
function maskDbUrl(rawUrl: string): string {
  try {
    const parsed = new URL(rawUrl);
    if (parsed.protocol === 'file:') {
      return `${parsed.protocol}${parsed.pathname}`;
    }
    return `${parsed.protocol}//${parsed.host}`;
  } catch {
    return '<unparseable url — host hidden>';
  }
}

const main = async () => {
  // Normalize: treat empty strings as unset (dotenv writes empty string for blank vars)
  const adminEmail = process.env.ADMIN_EMAIL || undefined;
  const adminPassword = process.env.ADMIN_PASSWORD || undefined;
  const tursoUrl = process.env.TURSO_DATABASE_URL || undefined;
  const provisionAllowLocal = process.env.PROVISION_ALLOW_LOCAL;

  // Guard A: ADMIN_EMAIL and ADMIN_PASSWORD are required
  if (!adminEmail || !adminPassword) {
    console.error(
      '[provision:admin] ERROR: provision:admin requires ADMIN_EMAIL and ADMIN_PASSWORD.',
    );
    process.exit(1);
  }

  // Guard B: TURSO_DATABASE_URL required unless PROVISION_ALLOW_LOCAL=true
  if (!tursoUrl && provisionAllowLocal !== 'true') {
    console.error(
      '[provision:admin] ERROR: Refusing to run: TURSO_DATABASE_URL is required.',
      'Set PROVISION_ALLOW_LOCAL=true ONLY for local verification against a throwaway file DB.',
    );
    process.exit(1);
  }

  // Resolve target URL (tursoUrl is already undefined for empty strings)
  const targetUrl = tursoUrl ?? LOCAL_DB_URL;

  // Print local mode banner if applicable
  if (!tursoUrl && provisionAllowLocal === 'true') {
    console.log('');
    console.log('!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!');
    console.log('[LOCAL VERIFICATION MODE — NOT PRODUCTION]');
    console.log('Targeting local file DB. This is NOT a production run.');
    console.log('!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!');
    console.log('');
  }

  // Print masked target host (never token/password/query string)
  const maskedHost = maskDbUrl(targetUrl);
  console.log(`[provision:admin] Target DB host: ${maskedHost}   (token: ***redacted***)`);

  // Force schema push ON for this process only.
  // This MUST happen BEFORE importing payload.config — the push gate is
  // evaluated at config module-evaluation time inside buildConfig().
  process.env.PAYLOAD_DISABLE_PUSH = 'false';
  process.env.NODE_ENV = 'development'; // forces isProduction() === false → push: true

  try {
    // Dynamic imports AFTER the env override so the push gate sees the correct values
    const { getPayload } = await import('payload');
    const { default: config } = await import('../payload.config');
    const { seedAdminUser } = await import('./seeders');

    // Runs schema push against the target DB (creates tables on first run)
    const payload = await getPayload({ config });

    // Idempotent admin creation — logs "already exists" on a second run
    await seedAdminUser(payload);
  } catch (error) {
    // Redact: never print env values in the error message
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('[provision:admin] ERROR: Provisioning failed.', message);
    process.exit(1);
  }

  process.exit(0);
};

main();
