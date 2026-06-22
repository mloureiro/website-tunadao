import { buildConfig } from 'payload';
import { sqliteAdapter } from '@payloadcms/db-sqlite';
import { lexicalEditor } from '@payloadcms/richtext-lexical';
import { resendAdapter } from '@payloadcms/email-resend';
import path from 'path';
import { fileURLToPath } from 'url';
import sharp from 'sharp';
import { LOCAL_DB_URL } from './lib/db-path';
import { isProduction } from './lib/env';

// Collections
import { Users } from './collections/Users';
import { Media } from './collections/Media';
import { AwardTypes } from './collections/AwardTypes';
import { Venues } from './collections/Venues';
import { Tunas } from './collections/Tunas';
import { CitadaoEditions } from './collections/CitadaoEditions';
import { CitadaoParticipants } from './collections/CitadaoParticipants';
import { CitadaoAwards } from './collections/CitadaoAwards';
import { Festivals } from './collections/Festivals';
import { FestivalAwards } from './collections/FestivalAwards';
import { FestivalParticipants } from './collections/FestivalParticipants';
import { BlogPosts } from './collections/BlogPosts';
import { Videos } from './collections/Videos';
import { Albums } from './collections/Albums';
import { Pages } from './collections/Pages';
import { ContactSubmissions } from './collections/ContactSubmissions';

// Globals
import { SiteSettings } from './globals/SiteSettings';
import { ContactInfo } from './globals/ContactInfo';

const filename = fileURLToPath(import.meta.url);
const dirname = path.dirname(filename);

const resolveSecret = (): string => {
  const secret = process.env.PAYLOAD_SECRET;
  if (secret) return secret;
  if (isProduction()) {
    throw new Error(
      'PAYLOAD_SECRET is required in production. Set it in the Render dashboard ' +
        '(render.yaml declares it via generateValue: true).',
    );
  }
  // Local dev only — non-secret, never used in production (guarded above).
  return 'dev-only-insecure-secret';
};

export default buildConfig({
  secret: resolveSecret(),
  serverURL: process.env.PAYLOAD_PUBLIC_SERVER_URL || 'http://localhost:3000',

  admin: {
    user: Users.slug,
    importMap: {
      baseDir: path.resolve(dirname),
    },
    meta: {
      titleSuffix: ' - Tunadao CMS',
    },
  },

  editor: lexicalEditor(),

  db: sqliteAdapter({
    client: {
      url: process.env.TURSO_DATABASE_URL || LOCAL_DB_URL,
      authToken: process.env.TURSO_AUTH_TOKEN,
    },
    push: process.env.PAYLOAD_DISABLE_PUSH !== 'true',
  }),

  email: process.env.RESEND_API_KEY
    ? resendAdapter({
        defaultFromAddress: 'noreply@tunadao.pt',
        defaultFromName: 'Tunadao 1998',
        apiKey: process.env.RESEND_API_KEY,
      })
    : undefined,

  collections: [
    Users,
    Media,
    AwardTypes,
    Venues,
    Tunas,
    CitadaoEditions,
    CitadaoParticipants,
    CitadaoAwards,
    Festivals,
    FestivalAwards,
    FestivalParticipants,
    BlogPosts,
    Videos,
    Albums,
    Pages,
    ContactSubmissions,
  ],

  globals: [SiteSettings, ContactInfo],

  plugins: [],

  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },

  sharp,

  cors: [
    'http://localhost:3000',
    'http://localhost:4321', // Astro dev server
    process.env.FRONTEND_URL || '',
  ].filter(Boolean),
  csrf: [
    'http://localhost:3000',
    'http://localhost:4321',
    process.env.FRONTEND_URL || '',
  ].filter(Boolean),
});
