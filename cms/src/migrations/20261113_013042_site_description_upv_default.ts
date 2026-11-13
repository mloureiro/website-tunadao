import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-sqlite'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.run(sql`PRAGMA foreign_keys=OFF;`)
  await db.run(sql`CREATE TABLE \`__new_site_settings\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`site_name\` text DEFAULT 'Tunadão 1998' NOT NULL,
  	\`site_description\` text DEFAULT 'Tuna da Universidade Politécnica de Viseu' NOT NULL,
  	\`logo_id\` integer,
  	\`favicon_id\` integer,
  	\`instagram\` text,
  	\`facebook\` text,
  	\`tiktok\` text,
  	\`youtube\` text,
  	\`spotify\` text,
  	\`default_seo_image_id\` integer,
  	\`google_analytics_id\` text,
  	\`updated_at\` text,
  	\`created_at\` text,
  	FOREIGN KEY (\`logo_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`favicon_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`default_seo_image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null
  );
  `)
  await db.run(sql`INSERT INTO \`__new_site_settings\`("id", "site_name", "site_description", "logo_id", "favicon_id", "instagram", "facebook", "tiktok", "youtube", "spotify", "default_seo_image_id", "google_analytics_id", "updated_at", "created_at") SELECT "id", "site_name", "site_description", "logo_id", "favicon_id", "instagram", "facebook", "tiktok", "youtube", "spotify", "default_seo_image_id", "google_analytics_id", "updated_at", "created_at" FROM \`site_settings\`;`)
  await db.run(sql`DROP TABLE \`site_settings\`;`)
  await db.run(sql`ALTER TABLE \`__new_site_settings\` RENAME TO \`site_settings\`;`)
  await db.run(sql`PRAGMA foreign_keys=ON;`)
  await db.run(sql`CREATE INDEX \`site_settings_logo_idx\` ON \`site_settings\` (\`logo_id\`);`)
  await db.run(sql`CREATE INDEX \`site_settings_favicon_idx\` ON \`site_settings\` (\`favicon_id\`);`)
  await db.run(sql`CREATE INDEX \`site_settings_default_seo_image_idx\` ON \`site_settings\` (\`default_seo_image_id\`);`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.run(sql`PRAGMA foreign_keys=OFF;`)
  await db.run(sql`CREATE TABLE \`__new_site_settings\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`site_name\` text DEFAULT 'Tunadão 1998' NOT NULL,
  	\`site_description\` text DEFAULT 'Tuna do Instituto Politécnico de Viseu' NOT NULL,
  	\`logo_id\` integer,
  	\`favicon_id\` integer,
  	\`instagram\` text,
  	\`facebook\` text,
  	\`tiktok\` text,
  	\`youtube\` text,
  	\`spotify\` text,
  	\`default_seo_image_id\` integer,
  	\`google_analytics_id\` text,
  	\`updated_at\` text,
  	\`created_at\` text,
  	FOREIGN KEY (\`logo_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`favicon_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`default_seo_image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null
  );
  `)
  await db.run(sql`INSERT INTO \`__new_site_settings\`("id", "site_name", "site_description", "logo_id", "favicon_id", "instagram", "facebook", "tiktok", "youtube", "spotify", "default_seo_image_id", "google_analytics_id", "updated_at", "created_at") SELECT "id", "site_name", "site_description", "logo_id", "favicon_id", "instagram", "facebook", "tiktok", "youtube", "spotify", "default_seo_image_id", "google_analytics_id", "updated_at", "created_at" FROM \`site_settings\`;`)
  await db.run(sql`DROP TABLE \`site_settings\`;`)
  await db.run(sql`ALTER TABLE \`__new_site_settings\` RENAME TO \`site_settings\`;`)
  await db.run(sql`PRAGMA foreign_keys=ON;`)
  await db.run(sql`CREATE INDEX \`site_settings_logo_idx\` ON \`site_settings\` (\`logo_id\`);`)
  await db.run(sql`CREATE INDEX \`site_settings_favicon_idx\` ON \`site_settings\` (\`favicon_id\`);`)
  await db.run(sql`CREATE INDEX \`site_settings_default_seo_image_idx\` ON \`site_settings\` (\`default_seo_image_id\`);`)
}
