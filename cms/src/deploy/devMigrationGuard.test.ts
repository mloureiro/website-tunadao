import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { createClient, type Client } from '@libsql/client';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { findDevMigrationRows, formatDevMigrationError } from './devMigrationGuard';

const CREATE_TABLE = `CREATE TABLE \`payload_migrations\` (
  \`id\` integer PRIMARY KEY NOT NULL,
  \`name\` text,
  \`batch\` numeric,
  \`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  \`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL
)`;

describe('dev migration guard', () => {
  let dir: string;
  let client: Client;

  beforeEach(() => {
    dir = mkdtempSync(join(tmpdir(), 'dev-migration-guard-'));
    client = createClient({ url: `file:${dir}/test.db` });
  });

  afterEach(() => {
    client.close();
    rmSync(dir, { recursive: true, force: true });
  });

  const migrate = async (): Promise<void> => {
    await client.execute(CREATE_TABLE);
    await client.execute(
      "INSERT INTO payload_migrations (name, batch) VALUES ('20260626_071809_initial_schema', 1), ('20261028_174845_payload_3_92_upgrade', 2)"
    );
  };

  it('passes on an empty database', async () => {
    expect(await findDevMigrationRows(client)).toEqual([]);
  });

  it('passes when migrations carry no dev row', async () => {
    await migrate();
    expect(await findDevMigrationRows(client)).toEqual([]);
  });

  it('returns only the dev row among normal rows', async () => {
    await migrate();
    await client.execute("INSERT INTO payload_migrations (name, batch) VALUES ('dev', -1)");

    const rows = await findDevMigrationRows(client);

    expect(rows).toHaveLength(1);
    expect(rows[0]).toMatchObject({ name: 'dev', batch: -1 });
  });

  it('names the row and the recovery heading in the message', async () => {
    await migrate();
    await client.execute("INSERT INTO payload_migrations (name, batch) VALUES ('dev', -1)");

    const [row] = await findDevMigrationRows(client);
    const message = formatDevMigrationError([row]);

    expect(message).toContain(`id=${row.id}`);
    expect(message).toContain('name=dev');
    expect(message).toContain('batch=-1');
    expect(message).toContain('Recovering from a dev-mode migration row');
  });
});
