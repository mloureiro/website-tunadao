import type { Client } from '@libsql/client';

export interface DevMigrationRow {
  id: number;
  name: string | null;
  batch: number;
  createdAt: string | null;
}

export const findDevMigrationRows = async (client: Client): Promise<DevMigrationRow[]> => {
  const table = await client.execute(
    "SELECT name FROM sqlite_master WHERE type = 'table' AND name = 'payload_migrations'"
  );
  if (table.rows.length === 0) return [];

  const result = await client.execute(
    'SELECT id, name, batch, created_at FROM payload_migrations WHERE batch = -1 ORDER BY id'
  );
  return result.rows.map((row) => ({
    id: Number(row.id),
    name: row.name === null ? null : String(row.name),
    batch: Number(row.batch),
    createdAt: row.created_at === null ? null : String(row.created_at),
  }));
};

export const formatDevMigrationError = (rows: readonly DevMigrationRow[]): string =>
  [
    '[migrate:preflight] Refusing to run payload migrate: payload_migrations holds a dev-mode row.',
    ...rows.map((r) => `  id=${r.id} name=${r.name} batch=${r.batch} created_at=${r.createdAt}`),
    'Payload writes this row when it pushes schema in dev mode against this database. With it present,',
    'payload migrate stops at an interactive confirmation that cannot be answered on Render.',
    'Back up the database, then follow "Recovering from a dev-mode migration row" in DEPLOY.md.',
  ].join('\n');
