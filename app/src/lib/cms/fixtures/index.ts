/**
 * CMS Fixtures - Data for builds when CMS is unavailable
 *
 * Priority:
 * 1. Load from cms-dump.json (exported from CMS via `npm run db:export -w cms`)
 * 2. Fall back to minimal E2E test data if dump doesn't exist
 *
 * The dump contains real data from the CMS database, ensuring the site works
 * even when the CMS is down or unavailable during build.
 */

import { readFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

import type {
  CMSCitadaoEdition,
  CMSCitadaoParticipant,
  CMSCitadaoAward,
  CMSTuna,
  CMSVenue,
  CMSFestival,
  CMSFestivalAward,
  CMSFestivalParticipant,
  CMSAwardType,
  CMSBlogPost,
  CMSVideo,
  CMSAlbum,
  CMSSiteSettings,
  CMSContactInfo,
  CMSPaginatedResponse,
} from '../types';

// Try multiple possible paths to find cms-dump.json
// This handles different build contexts (local dev, CI, bundled)
function findDumpPath(): string | null {
  const __dirname = dirname(fileURLToPath(import.meta.url));

  const possiblePaths = [
    // From project root (when cwd is project root)
    join(process.cwd(), 'data/cms-dump.json'),
    // From app/ directory (when cwd is app/)
    join(process.cwd(), '../data/cms-dump.json'),
    // Relative from source file location (5 levels up from app/src/lib/cms/fixtures/)
    join(__dirname, '../../../../../data/cms-dump.json'),
    // Relative from source file location (4 levels up - in case we're in dist/)
    join(__dirname, '../../../../data/cms-dump.json'),
  ];

  for (const p of possiblePaths) {
    if (existsSync(p)) {
      return p;
    }
  }

  // Debug: log what we tried
  console.log('[Fixtures] Searched for cms-dump.json in:');
  console.log(`  cwd: ${process.cwd()}`);
  console.log(`  __dirname: ${__dirname}`);
  for (const p of possiblePaths) {
    console.log(`  - ${p} (exists: ${existsSync(p)})`);
  }

  return null;
}

interface CMSDump {
  _meta: {
    exportedAt: string;
    version: string;
  };
  collections: {
    'award-types'?: { docs: CMSAwardType[]; totalDocs: number };
    tunas?: { docs: CMSTuna[]; totalDocs: number };
    venues?: { docs: CMSVenue[]; totalDocs: number };
    'citadao-editions'?: { docs: CMSCitadaoEdition[]; totalDocs: number };
    'citadao-participants'?: { docs: CMSCitadaoParticipant[]; totalDocs: number };
    'citadao-awards'?: { docs: CMSCitadaoAward[]; totalDocs: number };
    festivals?: { docs: CMSFestival[]; totalDocs: number };
    'festival-awards'?: { docs: CMSFestivalAward[]; totalDocs: number };
    'festival-participants'?: { docs: CMSFestivalParticipant[]; totalDocs: number };
    'blog-posts'?: { docs: CMSBlogPost[]; totalDocs: number };
    videos?: { docs: CMSVideo[]; totalDocs: number };
    albums?: { docs: CMSAlbum[]; totalDocs: number };
    pages?: { docs: unknown[]; totalDocs: number };
  };
  globals: {
    'site-settings'?: CMSSiteSettings;
    'contact-info'?: CMSContactInfo;
  };
}

// Load the CMS dump file if it exists
let cmsDump: CMSDump | null = null;
let dumpChecked = false;

function loadDump(): CMSDump | null {
  if (dumpChecked) return cmsDump;
  dumpChecked = true;

  const dumpPath = findDumpPath();
  if (!dumpPath) {
    console.log('[Fixtures] CMS dump not found, using minimal E2E data');
    return null;
  }

  try {
    const content = readFileSync(dumpPath, 'utf-8');
    cmsDump = JSON.parse(content) as CMSDump;
    console.log(`[Fixtures] Loaded CMS dump from ${dumpPath}`);
    console.log(`[Fixtures] Dump exported: ${cmsDump._meta?.exportedAt || 'unknown'}`);
    return cmsDump;
  } catch (error) {
    console.warn('[Fixtures] Failed to load CMS dump:', error);
    return null;
  }
}

// Helper to create paginated response
function paginate<T>(docs: T[]): CMSPaginatedResponse<T> {
  return {
    docs,
    totalDocs: docs.length,
    limit: 100,
    totalPages: 1,
    page: 1,
    pagingCounter: 1,
    hasPrevPage: false,
    hasNextPage: false,
    prevPage: null,
    nextPage: null,
  };
}

// Helper to get collection from dump or fallback
function getCollection<T>(
  collectionName: keyof CMSDump['collections'],
  fallback: T[]
): CMSPaginatedResponse<T> {
  const dump = loadDump();
  if (dump?.collections?.[collectionName]) {
    const collection = dump.collections[collectionName] as { docs: T[]; totalDocs: number };
    if (collection.docs.length > 0) {
      return paginate(collection.docs);
    }
  }
  return paginate(fallback);
}

// Helper to get global from dump or fallback
function getGlobal<T>(globalName: keyof CMSDump['globals'], fallback: T): T {
  const dump = loadDump();
  if (dump?.globals?.[globalName]) {
    return dump.globals[globalName] as T;
  }
  return fallback;
}

// =============================================================================
// MINIMAL E2E FALLBACK DATA
// =============================================================================

const fallbackAwardTypes: CMSAwardType[] = [
  { id: 1, name: 'Melhor Tuna', slug: 'melhor-tuna' },
  { id: 2, name: 'Melhor Serenata', slug: 'melhor-serenata' },
  { id: 3, name: 'Tuna Mais Tuna', slug: 'tuna-mais-tuna' },
  { id: 4, name: 'Tuna do Público', slug: 'tuna-do-publico' },
];

const fallbackTunas: CMSTuna[] = [
  { id: 1, shortName: 'TUM', fullName: 'Tuna Universitária do Minho' },
  { id: 2, shortName: 'TUP', fullName: 'Tuna Universitária do Porto' },
  { id: 3, shortName: 'EUL', fullName: 'Estudantina Universitária de Lisboa' },
  { id: 4, shortName: 'Afonsina', fullName: 'Afonsina - Tuna Académica da UC' },
];

const fallbackVenues: CMSVenue[] = [{ id: 1, name: 'Aula Magna IPV' }];

const fallbackCitadaoEditions: CMSCitadaoEdition[] = [
  {
    id: 1,
    title: 'XVIII CITADÃO',
    editionNumber: 18,
    startDate: '2024-05-04',
    endDate: '2024-05-04',
    // poster field enables .poster-button on the 2024 detail page for E2E a11y specs.
    // Using a self-hosted path that resolves against the Astro dev/preview server.
    poster: {
      id: 100,
      filename: 'og-image.jpg',
      url: '/og-image.jpg',
      alt: 'Cartaz XVIII CITADÃO',
      mimeType: 'image/jpeg',
    },
    schedule: [{ date: '2024-05-04', venue: fallbackVenues[0] }],
    status: 'published',
  },
  {
    id: 2,
    title: 'XVII CITADÃO',
    editionNumber: 17,
    startDate: '2023-05-05',
    endDate: '2023-05-06',
    schedule: [{ date: '2023-05-05', venue: fallbackVenues[0] }],
    status: 'published',
  },
];

const fallbackCitadaoParticipants: CMSCitadaoParticipant[] = [
  { id: 1, edition: fallbackCitadaoEditions[0], tuna: fallbackTunas[3], type: 'contestant' },
  { id: 2, edition: fallbackCitadaoEditions[0], tuna: fallbackTunas[0], type: 'contestant' },
  { id: 3, edition: fallbackCitadaoEditions[1], tuna: fallbackTunas[1], type: 'contestant' },
  { id: 4, edition: fallbackCitadaoEditions[1], tuna: fallbackTunas[2], type: 'contestant' },
];

const fallbackCitadaoAwards: CMSCitadaoAward[] = [
  {
    id: 1,
    edition: fallbackCitadaoEditions[0],
    award: fallbackAwardTypes[0],
    tuna: fallbackTunas[3],
  },
  {
    id: 2,
    edition: fallbackCitadaoEditions[1],
    award: fallbackAwardTypes[0],
    tuna: fallbackTunas[1],
  },
];

const fallbackFestivals: CMSFestival[] = [];
const fallbackFestivalAwards: CMSFestivalAward[] = [];
const fallbackBlogPosts: CMSBlogPost[] = [];
const fallbackVideos: CMSVideo[] = [
  {
    id: 1,
    title: 'Tunadão no CITADÃO 2024',
    youtubeUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    youtubeId: 'dQw4w9WgXcQ',
    category: 'citadao',
    featured: true,
    publishedAt: '2024-05-10T00:00:00.000Z',
    status: 'published',
  },
  {
    id: 2,
    title: 'Serenata na Aula Magna',
    youtubeUrl: 'https://www.youtube.com/watch?v=9bZkp7q19f0',
    youtubeId: '9bZkp7q19f0',
    category: 'serenata',
    featured: false,
    publishedAt: '2023-11-15T00:00:00.000Z',
    status: 'published',
  },
];
const fallbackAlbums: CMSAlbum[] = [
  {
    id: 1,
    title: 'Por Ruelas e Calçadas',
    year: 2003,
    coverImage: 1,
    spotifyUrl: 'https://open.spotify.com/album/3xcpAOCKk7soUNfdnTC6Sn',
    recordingType: 'live',
    status: 'published',
  },
  {
    id: 2,
    title: 'De Capa Bem Traçada',
    year: 2008,
    coverImage: 2,
    spotifyUrl: 'https://open.spotify.com/album/5ljVRcZan9DLkFDm5aWAgt',
    recordingType: 'studio',
    status: 'published',
  },
];

const fallbackSiteSettings: CMSSiteSettings = {
  id: 1,
  siteName: 'Tunadão 1998',
  siteDescription: 'Tuna Académica do Instituto Politécnico de Viseu',
  instagram: 'https://www.instagram.com/tunadao1998/',
  facebook: 'https://www.facebook.com/tunadao1998',
  youtube: 'https://www.youtube.com/@TUNADAO1998',
  spotify: 'https://open.spotify.com/artist/7HeYIxlV5Nb1KvZkBx00sH',
};

const fallbackContactInfo: CMSContactInfo = {
  id: 1,
  email: 'tunadao@gmail.com',
  phone: '+351 928 155 399',
  address: 'Campus Politécnico de Viseu, 3504-510 Viseu',
};

// =============================================================================
// EXPORTS
// =============================================================================

export const fixtures = {
  'citadao-editions': () => getCollection('citadao-editions', fallbackCitadaoEditions),
  'citadao-participants': () => getCollection('citadao-participants', fallbackCitadaoParticipants),
  'citadao-awards': () => getCollection('citadao-awards', fallbackCitadaoAwards),
  tunas: () => getCollection('tunas', fallbackTunas),
  venues: () => getCollection('venues', fallbackVenues),
  festivals: () => getCollection('festivals', fallbackFestivals),
  'festival-awards': () => getCollection('festival-awards', fallbackFestivalAwards),
  'festival-participants': () => getCollection('festival-participants', []),
  'award-types': () => getCollection('award-types', fallbackAwardTypes),
  'blog-posts': () => getCollection('blog-posts', fallbackBlogPosts),
  videos: () => getCollection('videos', fallbackVideos),
  albums: () => getCollection('albums', fallbackAlbums),
  pages: () => getCollection('pages', []),
} as const;

export const globalFixtures = {
  'site-settings': () => getGlobal('site-settings', fallbackSiteSettings),
  'contact-info': () => getGlobal('contact-info', fallbackContactInfo),
} as const;

export type FixtureEndpoint = keyof typeof fixtures;
export type GlobalFixtureEndpoint = keyof typeof globalFixtures;
