import { loadEnv } from 'payload/node';
import { createClient } from '@libsql/client';
import { resolveDbClientConfig } from '../lib/db-client';
import { findDevMigrationRows, formatDevMigrationError } from './devMigrationGuard';

loadEnv();

const client = createClient(resolveDbClientConfig());

try {
  const rows = await findDevMigrationRows(client);
  if (rows.length > 0) {
    console.error(formatDevMigrationError(rows));
    client.close();
    process.exit(1);
  }
  console.log('[migrate:preflight] No dev-mode migration row; continuing.');
  client.close();
  process.exit(0);
} catch (error) {
  client.close();
  throw error;
}
