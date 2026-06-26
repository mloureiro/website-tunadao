/**
 * CMS Client - Raw fetch functions for PayloadCMS REST API
 *
 * Environment variables:
 * - USE_TEST_FIXTURES=true: Force use of static fixtures (for E2E tests)
 * - FORCE_PROD_CMS=true: Require CMS connection, fail build if unavailable
 *
 * Default behavior (no env vars): Try CMS first, fallback to fixtures if unavailable.
 * This ensures builds succeed even when CMS is down.
 */

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
  CMSPage,
  CMSSiteSettings,
  CMSContactInfo,
  CMSPaginatedResponse,
} from './types';
import {
  fixtures,
  globalFixtures,
  type FixtureEndpoint,
  type GlobalFixtureEndpoint,
} from './fixtures';

const CMS_URL = import.meta.env.CMS_URL || 'http://localhost:3000';
// Use process.env directly to avoid Vite tree-shaking the fixture code
// This works because SSG runs in Node.js context
const USE_TEST_FIXTURES = process.env.USE_TEST_FIXTURES === 'true';
// When true, CMS connection is required - build fails if CMS is unavailable
// When false/unset, falls back to fixtures if CMS is unavailable
const FORCE_PROD_CMS = process.env.FORCE_PROD_CMS === 'true';

interface FetchOptions {
  depth?: number;
  where?: Record<string, unknown>;
  sort?: string;
  limit?: number;
  page?: number;
}

export class CMSError extends Error {
  constructor(
    message: string,
    public readonly endpoint: string,
    public readonly statusCode?: number
  ) {
    super(message);
    this.name = 'CMSError';
  }
}

function tryFixtureFallback<T>(endpoint: string): T {
  const fixtureKey = endpoint as FixtureEndpoint;
  if (fixtureKey in fixtures) {
    console.log(`[CMS:Fallback] Using fixture for ${endpoint}`);
    return fixtures[fixtureKey]() as T;
  }
  throw new CMSError(`No fixture found for endpoint: ${endpoint}`, endpoint);
}

async function fetchFromCMS<T>(endpoint: string, options: FetchOptions = {}): Promise<T> {
  // Use test fixtures if enabled (explicit fixture mode)
  if (USE_TEST_FIXTURES) {
    const fixtureKey = endpoint as FixtureEndpoint;
    if (fixtureKey in fixtures) {
      console.log(`[CMS:Fixtures] Using fixture for ${endpoint}`);
      return fixtures[fixtureKey]() as T;
    }
    throw new CMSError(`No fixture found for endpoint: ${endpoint}`, endpoint);
  }

  const { depth = 2, where, sort, limit, page } = options;

  const params = new URLSearchParams();
  params.set('depth', String(depth));

  if (where) {
    params.set('where', JSON.stringify(where));
  }
  if (sort) {
    params.set('sort', sort);
  }
  if (limit) {
    params.set('limit', String(limit));
  }
  if (page) {
    params.set('page', String(page));
  }

  const url = `${CMS_URL}/api/${endpoint}?${params.toString()}`;

  let response: Response;
  try {
    response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch {
    if (FORCE_PROD_CMS) {
      throw new CMSError(
        `Failed to connect to CMS at ${CMS_URL}. Is the CMS running? (FORCE_PROD_CMS=true)`,
        endpoint
      );
    }
    console.warn(`[CMS:Fallback] CMS unavailable at ${CMS_URL}, falling back to fixtures for ${endpoint}`);
    return tryFixtureFallback<T>(endpoint);
  }

  if (!response.ok) {
    if (FORCE_PROD_CMS) {
      throw new CMSError(
        `CMS returned error ${response.status} for ${endpoint} (FORCE_PROD_CMS=true)`,
        endpoint,
        response.status
      );
    }
    console.warn(`[CMS:Fallback] CMS error ${response.status} for ${endpoint}, falling back to fixtures`);
    return tryFixtureFallback<T>(endpoint);
  }

  const data = await response.json();
  return data;
}

function tryGlobalFixtureFallback<T>(slug: string): T {
  const fixtureKey = slug as GlobalFixtureEndpoint;
  if (fixtureKey in globalFixtures) {
    console.log(`[CMS:Fallback] Using fixture for global ${slug}`);
    return globalFixtures[fixtureKey]() as T;
  }
  throw new CMSError(`No fixture found for global: ${slug}`, `globals/${slug}`);
}

async function fetchGlobal<T>(slug: string): Promise<T> {
  // Use test fixtures if enabled (explicit fixture mode)
  if (USE_TEST_FIXTURES) {
    const fixtureKey = slug as GlobalFixtureEndpoint;
    if (fixtureKey in globalFixtures) {
      console.log(`[CMS:Fixtures] Using fixture for global ${slug}`);
      return globalFixtures[fixtureKey]() as T;
    }
    throw new CMSError(`No fixture found for global: ${slug}`, `globals/${slug}`);
  }

  const url = `${CMS_URL}/api/globals/${slug}?depth=2`;

  let response: Response;
  try {
    response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch {
    if (FORCE_PROD_CMS) {
      throw new CMSError(
        `Failed to connect to CMS at ${CMS_URL}. Is the CMS running? (FORCE_PROD_CMS=true)`,
        `globals/${slug}`
      );
    }
    console.warn(`[CMS:Fallback] CMS unavailable at ${CMS_URL}, falling back to fixtures for global ${slug}`);
    return tryGlobalFixtureFallback<T>(slug);
  }

  if (!response.ok) {
    if (FORCE_PROD_CMS) {
      throw new CMSError(
        `CMS returned error ${response.status} for global ${slug} (FORCE_PROD_CMS=true)`,
        `globals/${slug}`,
        response.status
      );
    }
    console.warn(`[CMS:Fallback] CMS error ${response.status} for global ${slug}, falling back to fixtures`);
    return tryGlobalFixtureFallback<T>(slug);
  }

  const data = await response.json();
  return data;
}

// Citadão Editions
export async function getCitadaoEditions(): Promise<CMSCitadaoEdition[]> {
  const response = await fetchFromCMS<CMSPaginatedResponse<CMSCitadaoEdition>>('citadao-editions', {
    where: { status: { equals: 'published' } },
    sort: '-startDate',
    limit: 100,
  });

  console.log(`[CMS] Fetched ${response.docs.length} Citadão editions`);
  return response.docs;
}

export async function getCitadaoEditionById(id: number): Promise<CMSCitadaoEdition | null> {
  const response = await fetchFromCMS<CMSPaginatedResponse<CMSCitadaoEdition>>('citadao-editions', {
    where: {
      and: [{ status: { equals: 'published' } }, { id: { equals: id } }],
    },
    limit: 1,
  });

  if (response.docs.length > 0) {
    console.log(`[CMS] Fetched Citadão edition ${id}`);
    return response.docs[0];
  }

  return null;
}

export async function getCitadaoEditionByYear(year: number): Promise<CMSCitadaoEdition | null> {
  // Extract year from startDate
  const response = await fetchFromCMS<CMSPaginatedResponse<CMSCitadaoEdition>>('citadao-editions', {
    where: { status: { equals: 'published' } },
    sort: '-startDate',
    limit: 100,
  });

  const edition = response.docs.find((e) => {
    const editionYear = new Date(e.startDate).getFullYear();
    return editionYear === year;
  });

  if (edition) {
    console.log(`[CMS] Fetched Citadão edition for year ${year}`);
    return edition;
  }

  return null;
}

// Citadão Participants
export async function getCitadaoParticipants(editionId?: number): Promise<CMSCitadaoParticipant[]> {
  const where: Record<string, unknown> = {};
  if (editionId !== undefined) {
    where.edition = { equals: editionId };
  }

  const response = await fetchFromCMS<CMSPaginatedResponse<CMSCitadaoParticipant>>(
    'citadao-participants',
    {
      where: Object.keys(where).length > 0 ? where : undefined,
      limit: 500,
      depth: 2,
    }
  );

  console.log(`[CMS] Fetched ${response.docs.length} Citadão participants`);
  return response.docs;
}

// Citadão Awards
export async function getCitadaoAwards(editionId?: number): Promise<CMSCitadaoAward[]> {
  const where: Record<string, unknown> = {};
  if (editionId !== undefined) {
    where.edition = { equals: editionId };
  }

  const response = await fetchFromCMS<CMSPaginatedResponse<CMSCitadaoAward>>('citadao-awards', {
    where: Object.keys(where).length > 0 ? where : undefined,
    limit: 500,
    depth: 2,
  });

  console.log(`[CMS] Fetched ${response.docs.length} Citadão awards`);
  return response.docs;
}

// Tunas
export async function getTunas(): Promise<CMSTuna[]> {
  const response = await fetchFromCMS<CMSPaginatedResponse<CMSTuna>>('tunas', {
    limit: 500,
  });

  console.log(`[CMS] Fetched ${response.docs.length} tunas`);
  return response.docs;
}

// Venues
export async function getVenues(): Promise<CMSVenue[]> {
  const response = await fetchFromCMS<CMSPaginatedResponse<CMSVenue>>('venues', {
    limit: 100,
  });

  console.log(`[CMS] Fetched ${response.docs.length} venues`);
  return response.docs;
}

// Festivals
export async function getFestivals(): Promise<CMSFestival[]> {
  const response = await fetchFromCMS<CMSPaginatedResponse<CMSFestival>>('festivals', {
    where: { status: { equals: 'published' } },
    sort: '-date',
    limit: 500,
    depth: 2, // Populate organizingTuna relationship
  });

  console.log(`[CMS] Fetched ${response.docs.length} festivals`);
  return response.docs;
}

export async function getFestivalAwards(): Promise<CMSFestivalAward[]> {
  const response = await fetchFromCMS<CMSPaginatedResponse<CMSFestivalAward>>('festival-awards', {
    limit: 1000,
    depth: 2,
  });

  console.log(`[CMS] Fetched ${response.docs.length} festival awards`);
  return response.docs;
}

// Festival Participants
export async function getFestivalParticipants(): Promise<CMSFestivalParticipant[]> {
  const response = await fetchFromCMS<CMSPaginatedResponse<CMSFestivalParticipant>>(
    'festival-participants',
    {
      limit: 2000,
      depth: 2,
    }
  );

  console.log(`[CMS] Fetched ${response.docs.length} festival participants`);
  return response.docs;
}

// Award Types
export async function getAwardTypes(): Promise<CMSAwardType[]> {
  const response = await fetchFromCMS<CMSPaginatedResponse<CMSAwardType>>('award-types', {
    limit: 100,
  });

  console.log(`[CMS] Fetched ${response.docs.length} award types`);
  return response.docs;
}

// Blog Posts
export async function getBlogPosts(): Promise<CMSBlogPost[]> {
  const response = await fetchFromCMS<CMSPaginatedResponse<CMSBlogPost>>('blog-posts', {
    where: { status: { equals: 'published' } },
    sort: '-publishedAt',
    limit: 100,
  });

  console.log(`[CMS] Fetched ${response.docs.length} blog posts`);
  return response.docs;
}

export async function getBlogPostBySlug(slug: string): Promise<CMSBlogPost | null> {
  const response = await fetchFromCMS<CMSPaginatedResponse<CMSBlogPost>>('blog-posts', {
    where: {
      and: [{ status: { equals: 'published' } }, { slug: { equals: slug } }],
    },
    limit: 1,
  });

  if (response.docs.length > 0) {
    console.log(`[CMS] Fetched blog post: ${slug}`);
    return response.docs[0];
  }

  return null;
}

// Videos
export async function getVideos(): Promise<CMSVideo[]> {
  const response = await fetchFromCMS<CMSPaginatedResponse<CMSVideo>>('videos', {
    where: { status: { equals: 'published' } },
    sort: '-publishedAt',
    limit: 100,
  });

  console.log(`[CMS] Fetched ${response.docs.length} videos`);
  return response.docs;
}

// Albums
export async function getAlbums(): Promise<CMSAlbum[]> {
  const response = await fetchFromCMS<CMSPaginatedResponse<CMSAlbum>>('albums', {
    where: { status: { equals: 'published' } },
    sort: '-year',
    limit: 100,
  });

  console.log(`[CMS] Fetched ${response.docs.length} albums`);
  return response.docs;
}

// Pages
export async function getPageBySlug(slug: string): Promise<CMSPage | null> {
  const response = await fetchFromCMS<CMSPaginatedResponse<CMSPage>>('pages', {
    where: {
      and: [{ status: { equals: 'published' } }, { slug: { equals: slug } }],
    },
    limit: 1,
  });

  if (response.docs.length > 0) {
    console.log(`[CMS] Fetched page: ${slug}`);
    return response.docs[0];
  }

  return null;
}

// Globals
export async function getSiteSettings(): Promise<CMSSiteSettings> {
  const data = await fetchGlobal<CMSSiteSettings>('site-settings');
  console.log('[CMS] Fetched site settings');
  return data;
}

export async function getContactInfo(): Promise<CMSContactInfo> {
  const data = await fetchGlobal<CMSContactInfo>('contact-info');
  console.log('[CMS] Fetched contact info');
  return data;
}

// Health check - throws if CMS is not reachable (only when FORCE_PROD_CMS=true)
export async function checkCMSConnection(): Promise<void> {
  if (USE_TEST_FIXTURES) {
    console.log('[CMS:Fixtures] Using test fixtures - skipping CMS connection check');
    return;
  }

  let response: Response;
  try {
    response = await fetch(`${CMS_URL}/api/health`, {
      method: 'GET',
    });
  } catch (error) {
    if (error instanceof CMSError) throw error;
    if (FORCE_PROD_CMS) {
      throw new CMSError(
        `Failed to connect to CMS at ${CMS_URL}. Is the CMS running? (FORCE_PROD_CMS=true)`,
        'health'
      );
    }
    console.warn(`[CMS:Fallback] CMS unavailable at ${CMS_URL}, will use fixtures as fallback`);
    return;
  }

  if (response.ok) {
    console.log(`[CMS] Connected to ${CMS_URL}`);
    return;
  }

  if (FORCE_PROD_CMS) {
    throw new CMSError(
      `CMS health check failed (${response.status}) at ${CMS_URL} (FORCE_PROD_CMS=true)`,
      'health',
      response.status
    );
  }
  console.warn(`[CMS:Fallback] CMS health check failed (${response.status}), will use fixtures as fallback`);
}
