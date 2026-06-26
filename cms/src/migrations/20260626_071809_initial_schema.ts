import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-sqlite'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.run(sql`CREATE TABLE \`users_sessions\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`created_at\` text,
  	\`expires_at\` text NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`users\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`users_sessions_order_idx\` ON \`users_sessions\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`users_sessions_parent_id_idx\` ON \`users_sessions\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`users\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`name\` text NOT NULL,
  	\`role\` text DEFAULT 'editor' NOT NULL,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`email\` text NOT NULL,
  	\`reset_password_token\` text,
  	\`reset_password_expiration\` text,
  	\`salt\` text,
  	\`hash\` text,
  	\`login_attempts\` numeric DEFAULT 0,
  	\`lock_until\` text
  );
  `)
  await db.run(sql`CREATE INDEX \`users_updated_at_idx\` ON \`users\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`users_created_at_idx\` ON \`users\` (\`created_at\`);`)
  await db.run(sql`CREATE UNIQUE INDEX \`users_email_idx\` ON \`users\` (\`email\`);`)
  await db.run(sql`CREATE TABLE \`media\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`filename\` text NOT NULL,
  	\`cloudinary\` text NOT NULL,
  	\`url\` text,
  	\`public_id\` text,
  	\`width\` numeric,
  	\`height\` numeric,
  	\`format\` text,
  	\`mime_type\` text,
  	\`filesize\` numeric,
  	\`alt\` text NOT NULL,
  	\`caption\` text,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL
  );
  `)
  await db.run(sql`CREATE INDEX \`media_updated_at_idx\` ON \`media\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`media_created_at_idx\` ON \`media\` (\`created_at\`);`)
  await db.run(sql`CREATE TABLE \`award_types_aliases\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`alias\` text NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`award_types\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`award_types_aliases_order_idx\` ON \`award_types_aliases\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`award_types_aliases_parent_id_idx\` ON \`award_types_aliases\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`award_types\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`name\` text NOT NULL,
  	\`slug\` text NOT NULL,
  	\`description\` text,
  	\`criteria\` text,
  	\`icon\` text,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL
  );
  `)
  await db.run(sql`CREATE UNIQUE INDEX \`award_types_slug_idx\` ON \`award_types\` (\`slug\`);`)
  await db.run(sql`CREATE INDEX \`award_types_updated_at_idx\` ON \`award_types\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`award_types_created_at_idx\` ON \`award_types\` (\`created_at\`);`)
  await db.run(sql`CREATE TABLE \`venues\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`name\` text NOT NULL,
  	\`address\` text,
  	\`photo_id\` integer,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	FOREIGN KEY (\`photo_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null
  );
  `)
  await db.run(sql`CREATE INDEX \`venues_photo_idx\` ON \`venues\` (\`photo_id\`);`)
  await db.run(sql`CREATE INDEX \`venues_updated_at_idx\` ON \`venues\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`venues_created_at_idx\` ON \`venues\` (\`created_at\`);`)
  await db.run(sql`CREATE TABLE \`tunas\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`short_name\` text NOT NULL,
  	\`full_name\` text NOT NULL,
  	\`logo_id\` integer,
  	\`city\` text,
  	\`type\` text DEFAULT 'tuna',
  	\`website\` text,
  	\`description\` text,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	FOREIGN KEY (\`logo_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null
  );
  `)
  await db.run(sql`CREATE UNIQUE INDEX \`tunas_short_name_idx\` ON \`tunas\` (\`short_name\`);`)
  await db.run(sql`CREATE INDEX \`tunas_logo_idx\` ON \`tunas\` (\`logo_id\`);`)
  await db.run(sql`CREATE INDEX \`tunas_updated_at_idx\` ON \`tunas\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`tunas_created_at_idx\` ON \`tunas\` (\`created_at\`);`)
  await db.run(sql`CREATE TABLE \`citadao_editions_schedule\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`date\` text NOT NULL,
  	\`venue_id\` integer NOT NULL,
  	FOREIGN KEY (\`venue_id\`) REFERENCES \`venues\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`citadao_editions\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`citadao_editions_schedule_order_idx\` ON \`citadao_editions_schedule\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`citadao_editions_schedule_parent_id_idx\` ON \`citadao_editions_schedule\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`citadao_editions_schedule_venue_idx\` ON \`citadao_editions_schedule\` (\`venue_id\`);`)
  await db.run(sql`CREATE TABLE \`citadao_editions\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`title\` text,
  	\`edition_number\` numeric NOT NULL,
  	\`start_date\` text NOT NULL,
  	\`end_date\` text NOT NULL,
  	\`poster_id\` integer,
  	\`description\` text,
  	\`notes\` text,
  	\`status\` text DEFAULT 'published' NOT NULL,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	FOREIGN KEY (\`poster_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null
  );
  `)
  await db.run(sql`CREATE UNIQUE INDEX \`citadao_editions_edition_number_idx\` ON \`citadao_editions\` (\`edition_number\`);`)
  await db.run(sql`CREATE INDEX \`citadao_editions_poster_idx\` ON \`citadao_editions\` (\`poster_id\`);`)
  await db.run(sql`CREATE INDEX \`citadao_editions_updated_at_idx\` ON \`citadao_editions\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`citadao_editions_created_at_idx\` ON \`citadao_editions\` (\`created_at\`);`)
  await db.run(sql`CREATE TABLE \`citadao_participants\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`edition_id\` integer NOT NULL,
  	\`tuna_id\` integer NOT NULL,
  	\`type\` text DEFAULT 'contestant' NOT NULL,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	FOREIGN KEY (\`edition_id\`) REFERENCES \`citadao_editions\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`tuna_id\`) REFERENCES \`tunas\`(\`id\`) ON UPDATE no action ON DELETE set null
  );
  `)
  await db.run(sql`CREATE INDEX \`citadao_participants_edition_idx\` ON \`citadao_participants\` (\`edition_id\`);`)
  await db.run(sql`CREATE INDEX \`citadao_participants_tuna_idx\` ON \`citadao_participants\` (\`tuna_id\`);`)
  await db.run(sql`CREATE INDEX \`citadao_participants_updated_at_idx\` ON \`citadao_participants\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`citadao_participants_created_at_idx\` ON \`citadao_participants\` (\`created_at\`);`)
  await db.run(sql`CREATE TABLE \`citadao_awards\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`edition_id\` integer NOT NULL,
  	\`award_id\` integer NOT NULL,
  	\`tuna_id\` integer NOT NULL,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	FOREIGN KEY (\`edition_id\`) REFERENCES \`citadao_editions\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`award_id\`) REFERENCES \`award_types\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`tuna_id\`) REFERENCES \`tunas\`(\`id\`) ON UPDATE no action ON DELETE set null
  );
  `)
  await db.run(sql`CREATE INDEX \`citadao_awards_edition_idx\` ON \`citadao_awards\` (\`edition_id\`);`)
  await db.run(sql`CREATE INDEX \`citadao_awards_award_idx\` ON \`citadao_awards\` (\`award_id\`);`)
  await db.run(sql`CREATE INDEX \`citadao_awards_tuna_idx\` ON \`citadao_awards\` (\`tuna_id\`);`)
  await db.run(sql`CREATE INDEX \`citadao_awards_updated_at_idx\` ON \`citadao_awards\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`citadao_awards_created_at_idx\` ON \`citadao_awards\` (\`created_at\`);`)
  await db.run(sql`CREATE TABLE \`festivals\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`name\` text NOT NULL,
  	\`date\` text NOT NULL,
  	\`location\` text,
  	\`organizing_tuna_id\` integer,
  	\`poster_id\` integer,
  	\`status\` text DEFAULT 'published' NOT NULL,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	FOREIGN KEY (\`organizing_tuna_id\`) REFERENCES \`tunas\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`poster_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null
  );
  `)
  await db.run(sql`CREATE INDEX \`festivals_organizing_tuna_idx\` ON \`festivals\` (\`organizing_tuna_id\`);`)
  await db.run(sql`CREATE INDEX \`festivals_poster_idx\` ON \`festivals\` (\`poster_id\`);`)
  await db.run(sql`CREATE INDEX \`festivals_updated_at_idx\` ON \`festivals\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`festivals_created_at_idx\` ON \`festivals\` (\`created_at\`);`)
  await db.run(sql`CREATE TABLE \`festival_awards\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`festival_id\` integer NOT NULL,
  	\`award_type_id\` integer,
  	\`custom_name\` text,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	FOREIGN KEY (\`festival_id\`) REFERENCES \`festivals\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`award_type_id\`) REFERENCES \`award_types\`(\`id\`) ON UPDATE no action ON DELETE set null
  );
  `)
  await db.run(sql`CREATE INDEX \`festival_awards_festival_idx\` ON \`festival_awards\` (\`festival_id\`);`)
  await db.run(sql`CREATE INDEX \`festival_awards_award_type_idx\` ON \`festival_awards\` (\`award_type_id\`);`)
  await db.run(sql`CREATE INDEX \`festival_awards_updated_at_idx\` ON \`festival_awards\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`festival_awards_created_at_idx\` ON \`festival_awards\` (\`created_at\`);`)
  await db.run(sql`CREATE TABLE \`festival_participants\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`festival_id\` integer NOT NULL,
  	\`tuna_id\` integer NOT NULL,
  	\`type\` text DEFAULT 'contestant' NOT NULL,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	FOREIGN KEY (\`festival_id\`) REFERENCES \`festivals\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`tuna_id\`) REFERENCES \`tunas\`(\`id\`) ON UPDATE no action ON DELETE set null
  );
  `)
  await db.run(sql`CREATE INDEX \`festival_participants_festival_idx\` ON \`festival_participants\` (\`festival_id\`);`)
  await db.run(sql`CREATE INDEX \`festival_participants_tuna_idx\` ON \`festival_participants\` (\`tuna_id\`);`)
  await db.run(sql`CREATE INDEX \`festival_participants_updated_at_idx\` ON \`festival_participants\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`festival_participants_created_at_idx\` ON \`festival_participants\` (\`created_at\`);`)
  await db.run(sql`CREATE TABLE \`blog_posts_tags\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`tag\` text NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`blog_posts\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`blog_posts_tags_order_idx\` ON \`blog_posts_tags\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`blog_posts_tags_parent_id_idx\` ON \`blog_posts_tags\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`blog_posts\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`title\` text NOT NULL,
  	\`slug\` text NOT NULL,
  	\`excerpt\` text NOT NULL,
  	\`content\` text NOT NULL,
  	\`featured_image_id\` integer NOT NULL,
  	\`author_id\` integer NOT NULL,
  	\`published_at\` text NOT NULL,
  	\`status\` text DEFAULT 'draft' NOT NULL,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	FOREIGN KEY (\`featured_image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`author_id\`) REFERENCES \`users\`(\`id\`) ON UPDATE no action ON DELETE set null
  );
  `)
  await db.run(sql`CREATE UNIQUE INDEX \`blog_posts_slug_idx\` ON \`blog_posts\` (\`slug\`);`)
  await db.run(sql`CREATE INDEX \`blog_posts_featured_image_idx\` ON \`blog_posts\` (\`featured_image_id\`);`)
  await db.run(sql`CREATE INDEX \`blog_posts_author_idx\` ON \`blog_posts\` (\`author_id\`);`)
  await db.run(sql`CREATE INDEX \`blog_posts_updated_at_idx\` ON \`blog_posts\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`blog_posts_created_at_idx\` ON \`blog_posts\` (\`created_at\`);`)
  await db.run(sql`CREATE TABLE \`videos\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`title\` text NOT NULL,
  	\`youtube_url\` text NOT NULL,
  	\`youtube_id\` text,
  	\`description\` text,
  	\`category\` text NOT NULL,
  	\`featured\` integer DEFAULT false,
  	\`published_at\` text NOT NULL,
  	\`status\` text DEFAULT 'draft' NOT NULL,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL
  );
  `)
  await db.run(sql`CREATE INDEX \`videos_updated_at_idx\` ON \`videos\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`videos_created_at_idx\` ON \`videos\` (\`created_at\`);`)
  await db.run(sql`CREATE TABLE \`albums_tracks\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`number\` numeric NOT NULL,
  	\`title\` text NOT NULL,
  	\`duration\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`albums\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`albums_tracks_order_idx\` ON \`albums_tracks\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`albums_tracks_parent_id_idx\` ON \`albums_tracks\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`albums\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`title\` text NOT NULL,
  	\`year\` numeric NOT NULL,
  	\`cover_image_id\` integer NOT NULL,
  	\`description\` text,
  	\`spotify_url\` text,
  	\`recording_type\` text,
  	\`status\` text DEFAULT 'published' NOT NULL,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	FOREIGN KEY (\`cover_image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null
  );
  `)
  await db.run(sql`CREATE INDEX \`albums_cover_image_idx\` ON \`albums\` (\`cover_image_id\`);`)
  await db.run(sql`CREATE INDEX \`albums_updated_at_idx\` ON \`albums\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`albums_created_at_idx\` ON \`albums\` (\`created_at\`);`)
  await db.run(sql`CREATE TABLE \`pages\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`title\` text NOT NULL,
  	\`slug\` text NOT NULL,
  	\`content\` text NOT NULL,
  	\`seo_title\` text,
  	\`seo_description\` text,
  	\`seo_image_id\` integer,
  	\`status\` text DEFAULT 'draft' NOT NULL,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	FOREIGN KEY (\`seo_image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null
  );
  `)
  await db.run(sql`CREATE UNIQUE INDEX \`pages_slug_idx\` ON \`pages\` (\`slug\`);`)
  await db.run(sql`CREATE INDEX \`pages_seo_image_idx\` ON \`pages\` (\`seo_image_id\`);`)
  await db.run(sql`CREATE INDEX \`pages_updated_at_idx\` ON \`pages\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`pages_created_at_idx\` ON \`pages\` (\`created_at\`);`)
  await db.run(sql`CREATE TABLE \`contact_submissions\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`name\` text NOT NULL,
  	\`email\` text NOT NULL,
  	\`subject\` text NOT NULL,
  	\`message\` text NOT NULL,
  	\`status\` text DEFAULT 'new' NOT NULL,
  	\`notes\` text,
  	\`honeypot\` text,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL
  );
  `)
  await db.run(sql`CREATE INDEX \`contact_submissions_updated_at_idx\` ON \`contact_submissions\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`contact_submissions_created_at_idx\` ON \`contact_submissions\` (\`created_at\`);`)
  await db.run(sql`CREATE TABLE \`payload_kv\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`key\` text NOT NULL,
  	\`data\` text NOT NULL
  );
  `)
  await db.run(sql`CREATE UNIQUE INDEX \`payload_kv_key_idx\` ON \`payload_kv\` (\`key\`);`)
  await db.run(sql`CREATE TABLE \`payload_locked_documents\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`global_slug\` text,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL
  );
  `)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_global_slug_idx\` ON \`payload_locked_documents\` (\`global_slug\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_updated_at_idx\` ON \`payload_locked_documents\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_created_at_idx\` ON \`payload_locked_documents\` (\`created_at\`);`)
  await db.run(sql`CREATE TABLE \`payload_locked_documents_rels\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`order\` integer,
  	\`parent_id\` integer NOT NULL,
  	\`path\` text NOT NULL,
  	\`users_id\` integer,
  	\`media_id\` integer,
  	\`award_types_id\` integer,
  	\`venues_id\` integer,
  	\`tunas_id\` integer,
  	\`citadao_editions_id\` integer,
  	\`citadao_participants_id\` integer,
  	\`citadao_awards_id\` integer,
  	\`festivals_id\` integer,
  	\`festival_awards_id\` integer,
  	\`festival_participants_id\` integer,
  	\`blog_posts_id\` integer,
  	\`videos_id\` integer,
  	\`albums_id\` integer,
  	\`pages_id\` integer,
  	\`contact_submissions_id\` integer,
  	FOREIGN KEY (\`parent_id\`) REFERENCES \`payload_locked_documents\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`users_id\`) REFERENCES \`users\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`media_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`award_types_id\`) REFERENCES \`award_types\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`venues_id\`) REFERENCES \`venues\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`tunas_id\`) REFERENCES \`tunas\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`citadao_editions_id\`) REFERENCES \`citadao_editions\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`citadao_participants_id\`) REFERENCES \`citadao_participants\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`citadao_awards_id\`) REFERENCES \`citadao_awards\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`festivals_id\`) REFERENCES \`festivals\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`festival_awards_id\`) REFERENCES \`festival_awards\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`festival_participants_id\`) REFERENCES \`festival_participants\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`blog_posts_id\`) REFERENCES \`blog_posts\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`videos_id\`) REFERENCES \`videos\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`albums_id\`) REFERENCES \`albums\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`pages_id\`) REFERENCES \`pages\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`contact_submissions_id\`) REFERENCES \`contact_submissions\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_order_idx\` ON \`payload_locked_documents_rels\` (\`order\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_parent_idx\` ON \`payload_locked_documents_rels\` (\`parent_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_path_idx\` ON \`payload_locked_documents_rels\` (\`path\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_users_id_idx\` ON \`payload_locked_documents_rels\` (\`users_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_media_id_idx\` ON \`payload_locked_documents_rels\` (\`media_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_award_types_id_idx\` ON \`payload_locked_documents_rels\` (\`award_types_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_venues_id_idx\` ON \`payload_locked_documents_rels\` (\`venues_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_tunas_id_idx\` ON \`payload_locked_documents_rels\` (\`tunas_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_citadao_editions_id_idx\` ON \`payload_locked_documents_rels\` (\`citadao_editions_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_citadao_participants_id_idx\` ON \`payload_locked_documents_rels\` (\`citadao_participants_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_citadao_awards_id_idx\` ON \`payload_locked_documents_rels\` (\`citadao_awards_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_festivals_id_idx\` ON \`payload_locked_documents_rels\` (\`festivals_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_festival_awards_id_idx\` ON \`payload_locked_documents_rels\` (\`festival_awards_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_festival_participants_id_idx\` ON \`payload_locked_documents_rels\` (\`festival_participants_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_blog_posts_id_idx\` ON \`payload_locked_documents_rels\` (\`blog_posts_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_videos_id_idx\` ON \`payload_locked_documents_rels\` (\`videos_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_albums_id_idx\` ON \`payload_locked_documents_rels\` (\`albums_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_pages_id_idx\` ON \`payload_locked_documents_rels\` (\`pages_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_contact_submissions_id_idx\` ON \`payload_locked_documents_rels\` (\`contact_submissions_id\`);`)
  await db.run(sql`CREATE TABLE \`payload_preferences\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`key\` text,
  	\`value\` text,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL
  );
  `)
  await db.run(sql`CREATE INDEX \`payload_preferences_key_idx\` ON \`payload_preferences\` (\`key\`);`)
  await db.run(sql`CREATE INDEX \`payload_preferences_updated_at_idx\` ON \`payload_preferences\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`payload_preferences_created_at_idx\` ON \`payload_preferences\` (\`created_at\`);`)
  await db.run(sql`CREATE TABLE \`payload_preferences_rels\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`order\` integer,
  	\`parent_id\` integer NOT NULL,
  	\`path\` text NOT NULL,
  	\`users_id\` integer,
  	FOREIGN KEY (\`parent_id\`) REFERENCES \`payload_preferences\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`users_id\`) REFERENCES \`users\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`payload_preferences_rels_order_idx\` ON \`payload_preferences_rels\` (\`order\`);`)
  await db.run(sql`CREATE INDEX \`payload_preferences_rels_parent_idx\` ON \`payload_preferences_rels\` (\`parent_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_preferences_rels_path_idx\` ON \`payload_preferences_rels\` (\`path\`);`)
  await db.run(sql`CREATE INDEX \`payload_preferences_rels_users_id_idx\` ON \`payload_preferences_rels\` (\`users_id\`);`)
  await db.run(sql`CREATE TABLE \`payload_migrations\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`name\` text,
  	\`batch\` numeric,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL
  );
  `)
  await db.run(sql`CREATE INDEX \`payload_migrations_updated_at_idx\` ON \`payload_migrations\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`payload_migrations_created_at_idx\` ON \`payload_migrations\` (\`created_at\`);`)
  await db.run(sql`CREATE TABLE \`site_settings\` (
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
  await db.run(sql`CREATE INDEX \`site_settings_logo_idx\` ON \`site_settings\` (\`logo_id\`);`)
  await db.run(sql`CREATE INDEX \`site_settings_favicon_idx\` ON \`site_settings\` (\`favicon_id\`);`)
  await db.run(sql`CREATE INDEX \`site_settings_default_seo_image_idx\` ON \`site_settings\` (\`default_seo_image_id\`);`)
  await db.run(sql`CREATE TABLE \`contact_info\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`email\` text DEFAULT 'tunadao@gmail.com' NOT NULL,
  	\`phone\` text DEFAULT '+351 928 155 399',
  	\`address\` text DEFAULT 'Campus Politécnico de Viseu
  3504-510 Viseu',
  	\`map_embed_url\` text,
  	\`coordinates_latitude\` numeric,
  	\`coordinates_longitude\` numeric,
  	\`updated_at\` text,
  	\`created_at\` text
  );
  `)
  await db.run(sql`CREATE TABLE \`rebuild_status\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`outcome\` text,
  	\`timestamp\` text,
  	\`workflow_file\` text,
  	\`trigger_collection\` text,
  	\`trigger_operation\` text,
  	\`http_status\` numeric,
  	\`error_detail\` text,
  	\`updated_at\` text,
  	\`created_at\` text
  );
  `)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.run(sql`DROP TABLE \`users_sessions\`;`)
  await db.run(sql`DROP TABLE \`users\`;`)
  await db.run(sql`DROP TABLE \`media\`;`)
  await db.run(sql`DROP TABLE \`award_types_aliases\`;`)
  await db.run(sql`DROP TABLE \`award_types\`;`)
  await db.run(sql`DROP TABLE \`venues\`;`)
  await db.run(sql`DROP TABLE \`tunas\`;`)
  await db.run(sql`DROP TABLE \`citadao_editions_schedule\`;`)
  await db.run(sql`DROP TABLE \`citadao_editions\`;`)
  await db.run(sql`DROP TABLE \`citadao_participants\`;`)
  await db.run(sql`DROP TABLE \`citadao_awards\`;`)
  await db.run(sql`DROP TABLE \`festivals\`;`)
  await db.run(sql`DROP TABLE \`festival_awards\`;`)
  await db.run(sql`DROP TABLE \`festival_participants\`;`)
  await db.run(sql`DROP TABLE \`blog_posts_tags\`;`)
  await db.run(sql`DROP TABLE \`blog_posts\`;`)
  await db.run(sql`DROP TABLE \`videos\`;`)
  await db.run(sql`DROP TABLE \`albums_tracks\`;`)
  await db.run(sql`DROP TABLE \`albums\`;`)
  await db.run(sql`DROP TABLE \`pages\`;`)
  await db.run(sql`DROP TABLE \`contact_submissions\`;`)
  await db.run(sql`DROP TABLE \`payload_kv\`;`)
  await db.run(sql`DROP TABLE \`payload_locked_documents\`;`)
  await db.run(sql`DROP TABLE \`payload_locked_documents_rels\`;`)
  await db.run(sql`DROP TABLE \`payload_preferences\`;`)
  await db.run(sql`DROP TABLE \`payload_preferences_rels\`;`)
  await db.run(sql`DROP TABLE \`payload_migrations\`;`)
  await db.run(sql`DROP TABLE \`site_settings\`;`)
  await db.run(sql`DROP TABLE \`contact_info\`;`)
  await db.run(sql`DROP TABLE \`rebuild_status\`;`)
}
