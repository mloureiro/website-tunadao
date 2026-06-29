/**
 * CMS Public API - Main entry point with data transformation
 */

import type {
  CMSCitadaoEdition,
  CMSCitadaoParticipant,
  CMSCitadaoAward,
  CMSTuna,
  CMSVenue,
  CMSAwardType,
  CMSBlogPost,
  CMSVideo,
  CMSAlbum,
  CMSFestival,
  CMSFestivalAward,
  CMSFestivalParticipant,
  CMSMedia,
  FrontendCitadaoEdition,
  FrontendTunaWithLogo,
  FrontendBlogPost,
  FrontendVideo,
  FrontendAlbum,
  FrontendPalmaresYear,
  FrontendContactInfo,
  FrontendSocialLinks,
} from './types';

import * as client from './client';
import { richTextToHtml, estimateReadingTime } from './rich-text';

// Re-export types
export type * from './types';

// Re-export utilities
export { richTextToHtml, estimateReadingTime } from './rich-text';
export { CMSError } from './client';
export {
  AWARD_PRIORITY,
  getAwardPriority,
  isTopPrize,
  sortAwards,
  groupAwardsByTuna,
  splitTunasByAwards,
  type TunaWithAwards,
  type TunaWithAwardsExtended,
} from './awards';
export {
  CLOUDINARY_CLOUD_NAME,
  POSTER_TRANSFORMATIONS,
  POSTER_SIZES,
  getCloudinaryUrl,
  getPosterUrl,
  getPosterSrcSet,
  extractPublicId,
  type PosterTransformation,
} from './cloudinary';

const CMS_URL = import.meta.env.CMS_URL || 'http://localhost:3000';

/**
 * Get the CMS media URL
 */
export function getMediaUrl(media: CMSMedia | number | string | undefined | null): string {
  if (!media) return '';

  if (typeof media === 'number') {
    // It's an ID number, construct the URL
    return `${CMS_URL}/media/${media}`;
  }

  if (typeof media === 'string') {
    // It's already an ID or URL
    if (media.startsWith('http') || media.startsWith('/')) {
      return media;
    }
    // It's an ID, construct the URL
    return `${CMS_URL}/media/${media}`;
  }

  // It's a CMSMedia object
  if (media.url) {
    // If URL is relative, make it absolute
    if (media.url.startsWith('/')) {
      return `${CMS_URL}${media.url}`;
    }
    return media.url;
  }

  return '';
}

// =============================================================================
// CITADÃO EDITIONS
// =============================================================================

/**
 * Helper to check if tuna is populated (has the full object, not just ID)
 */
function isTunaPopulated(tuna: CMSTuna | number | string): tuna is CMSTuna {
  return typeof tuna === 'object' && tuna !== null && 'shortName' in tuna;
}

/**
 * Helper to extract clean short name (removes timestamp suffix if present)
 * e.g., "eul-1769429567906" -> "EUL"
 */
export function cleanShortName(shortName: string): string {
  // Check if it has a timestamp suffix (slug-timestamp pattern)
  const match = shortName.match(/^(.+)-\d{10,}$/);
  if (match) {
    // Return the slug part, uppercased
    return match[1].toUpperCase();
  }
  return shortName;
}

/**
 * Helper to transform a tuna into FrontendTunaWithLogo
 */
function transformTunaWithLogo(tuna: CMSTuna | number | string): FrontendTunaWithLogo {
  if (!isTunaPopulated(tuna)) {
    console.warn('[CMS] Tuna relationship not populated:', tuna);
    return {
      shortName: '—',
      fullName: '—',
    };
  }
  return {
    shortName: cleanShortName(tuna.shortName),
    fullName: tuna.fullName || cleanShortName(tuna.shortName),
    logoUrl: getMediaUrl(tuna.logo) || undefined,
    city: tuna.city,
    website: tuna.website,
  };
}

/**
 * Helper to get tuna short name (for awards)
 */
function getTunaShortName(tuna: CMSTuna | number | string): string {
  if (!isTunaPopulated(tuna)) {
    console.warn('[CMS] Tuna relationship not populated:', tuna);
    return '—';
  }
  return cleanShortName(tuna.shortName) || tuna.fullName;
}

/**
 * Helper to get award slug from award type
 */
function getAwardSlug(award: CMSAwardType | number): string {
  if (typeof award === 'number') {
    return `award-${award}`;
  }
  return award.slug;
}

/**
 * Helper to get venue name from schedule
 */
function getVenueName(venue: CMSVenue | number): string {
  if (typeof venue === 'number') {
    return '';
  }
  return venue.name;
}

/**
 * Format date range for display
 */
export function formatDateRange(startDate: string, endDate: string): string {
  const start = new Date(startDate);
  const end = new Date(endDate);

  const startDay = start.getDate();
  const endDay = end.getDate();
  const month = start.toLocaleString('pt-PT', { month: 'long' });

  if (startDay === endDay) {
    return `${startDay} ${month.charAt(0).toUpperCase() + month.slice(1)}`;
  }

  return `${startDay}-${endDay} ${month.charAt(0).toUpperCase() + month.slice(1)}`;
}

/**
 * Transform edition with participants and awards into frontend format
 */
function transformCitadaoEdition(
  cms: CMSCitadaoEdition,
  participants: CMSCitadaoParticipant[],
  awards: CMSCitadaoAward[]
): FrontendCitadaoEdition {
  // Get year from startDate
  const year = new Date(cms.startDate).getFullYear();

  // Format date range
  const date = formatDateRange(cms.startDate, cms.endDate);

  // Get venue(s) from schedule
  const venues =
    cms.schedule
      ?.map((s) => getVenueName(s.venue))
      .filter((v) => v)
      .filter((v, i, arr) => arr.indexOf(v) === i) || [];
  const venue = venues.join(' / ') || '';

  // Filter participants for this edition
  const editionParticipants = participants.filter((p) => {
    const editionId = typeof p.edition === 'number' ? p.edition : p.edition.id;
    return editionId === cms.id;
  });

  // Separate contestants and guests
  const tunas = editionParticipants
    .filter((p) => p.type === 'contestant')
    .map((p) => transformTunaWithLogo(p.tuna));

  const guests = editionParticipants
    .filter((p) => p.type === 'guest')
    .map((p) => transformTunaWithLogo(p.tuna));

  // Filter awards for this edition and transform to Record<string, string>
  const editionAwards = awards.filter((a) => {
    const editionId = typeof a.edition === 'number' ? a.edition : a.edition.id;
    return editionId === cms.id;
  });

  let awardsRecord: Record<string, string> | null = null;
  if (editionAwards.length > 0) {
    awardsRecord = {};
    for (const award of editionAwards) {
      const slug = getAwardSlug(award.award);
      const winner = getTunaShortName(award.tuna);
      awardsRecord[slug] = winner;
    }
  }

  // Get poster URL if available
  const posterUrl = getMediaUrl(cms.poster) || undefined;

  return {
    edition: cms.editionNumber,
    year,
    date,
    venue,
    tunas,
    guests,
    awards: awardsRecord,
    notes: cms.notes,
    posterUrl,
  };
}

export async function getCitadaoEditions(): Promise<FrontendCitadaoEdition[]> {
  // Fetch all data in parallel
  const [cmsEditions, participants, awards] = await Promise.all([
    client.getCitadaoEditions(),
    client.getCitadaoParticipants(),
    client.getCitadaoAwards(),
  ]);

  const editions = cmsEditions.map((edition) =>
    transformCitadaoEdition(edition, participants, awards)
  );

  // Sort by year descending (newest first)
  return editions.sort((a, b) => b.year - a.year);
}

export async function getCitadaoEditionByYear(
  year: number
): Promise<FrontendCitadaoEdition | null> {
  const cmsEdition = await client.getCitadaoEditionByYear(year);
  if (!cmsEdition) {
    return null;
  }

  // Fetch participants and awards for this edition
  const [participants, awards] = await Promise.all([
    client.getCitadaoParticipants(cmsEdition.id),
    client.getCitadaoAwards(cmsEdition.id),
  ]);

  return transformCitadaoEdition(cmsEdition, participants, awards);
}

// =============================================================================
// BLOG POSTS
// =============================================================================

function transformBlogPost(cms: CMSBlogPost): FrontendBlogPost {
  const content = richTextToHtml(cms.content);
  const readingTime = estimateReadingTime(cms.content);

  // Get first tag as category, or default to 'Notícias'
  const category = cms.tags?.[0]?.tag || 'Notícias';

  // Get featured image URL
  const image = getMediaUrl(cms.featuredImage);

  return {
    slug: cms.slug,
    title: cms.title,
    excerpt: cms.excerpt,
    content,
    date: cms.publishedAt,
    image,
    category,
    readingTime,
  };
}

export async function getBlogPosts(): Promise<FrontendBlogPost[]> {
  const cmsPosts = await client.getBlogPosts();
  return cmsPosts.map(transformBlogPost);
}

export async function getBlogPostBySlug(slug: string): Promise<FrontendBlogPost | null> {
  const cmsPost = await client.getBlogPostBySlug(slug);
  if (cmsPost) {
    return transformBlogPost(cmsPost);
  }
  return null;
}

export async function getBlogPostSlugs(): Promise<string[]> {
  const cmsPosts = await client.getBlogPosts();
  return cmsPosts.map((p) => p.slug);
}

// =============================================================================
// VIDEOS
// =============================================================================

function transformVideo(cms: CMSVideo): FrontendVideo {
  const year = new Date(cms.publishedAt).getFullYear();

  return {
    id: String(cms.id),
    title: cms.title,
    youtubeId: cms.youtubeId || '',
    category: cms.category,
    year,
  };
}

export async function getVideos(): Promise<FrontendVideo[]> {
  const cmsVideos = await client.getVideos();
  return cmsVideos.map(transformVideo);
}

// =============================================================================
// ALBUMS
// =============================================================================

export function extractSpotifyAlbumId(spotifyUrl: string | undefined): string | undefined {
  if (!spotifyUrl) return undefined;

  // Extract album ID from Spotify URL
  // e.g., https://open.spotify.com/album/5ljVRcZan9DLkFDm5aWAgt
  const match = spotifyUrl.match(/album\/([a-zA-Z0-9]+)/);
  return match ? match[1] : undefined;
}

function transformAlbum(cms: CMSAlbum): FrontendAlbum {
  const description = cms.description ? richTextToHtml(cms.description) : '';

  return {
    id: String(cms.id),
    title: cms.title,
    year: cms.year,
    spotifyAlbumId: extractSpotifyAlbumId(cms.spotifyUrl),
    description,
    type: cms.recordingType || 'studio',
  };
}

export async function getAlbums(): Promise<FrontendAlbum[]> {
  const cmsAlbums = await client.getAlbums();
  return cmsAlbums.map(transformAlbum);
}

// =============================================================================
// PALMARÉS (from Festivals + FestivalAwards)
// =============================================================================

export async function getPalmaresYears(): Promise<FrontendPalmaresYear[]> {
  const [cmsFestivals, cmsFestivalAwards, cmsAwardTypes, cmsFestivalParticipants] =
    await Promise.all([
      client.getFestivals(),
      client.getFestivalAwards(),
      client.getAwardTypes(),
      client.getFestivalParticipants(),
    ]);

  // Create a map of award type IDs to { slug, name }
  const awardTypesMap = new Map<number, { slug: string; name: string }>();
  for (const at of cmsAwardTypes) {
    awardTypesMap.set(Number(at.id), { slug: at.slug, name: at.name });
  }

  // Create a map of festival IDs to their awards
  const festivalAwardsMap = new Map<number, CMSFestivalAward[]>();
  for (const award of cmsFestivalAwards) {
    const festivalId = typeof award.festival === 'number' ? award.festival : award.festival.id;
    if (!festivalAwardsMap.has(festivalId)) {
      festivalAwardsMap.set(festivalId, []);
    }
    festivalAwardsMap.get(festivalId)!.push(award);
  }

  // Create a map of festival IDs to their participants
  const festivalParticipantsMap = new Map<number, CMSFestivalParticipant[]>();
  for (const participant of cmsFestivalParticipants) {
    const festivalId =
      typeof participant.festival === 'number' ? participant.festival : participant.festival.id;
    if (!festivalParticipantsMap.has(festivalId)) {
      festivalParticipantsMap.set(festivalId, []);
    }
    festivalParticipantsMap.get(festivalId)!.push(participant);
  }

  // Group festivals by year
  const festivalsByYear = new Map<number, CMSFestival[]>();
  for (const festival of cmsFestivals) {
    const year = new Date(festival.date).getFullYear();
    if (!festivalsByYear.has(year)) {
      festivalsByYear.set(year, []);
    }
    festivalsByYear.get(year)!.push(festival);
  }

  // Transform to FrontendPalmaresYear format
  const palmaresYears: FrontendPalmaresYear[] = [];

  for (const [year, festivals] of festivalsByYear) {
    palmaresYears.push({
      year,
      festivals: festivals.map((festival) => {
        // Transform organizing tuna if present
        let organizingTuna: FrontendPalmaresYear['festivals'][0]['organizingTuna'] = undefined;
        if (festival.organizingTuna) {
          const tuna =
            typeof festival.organizingTuna === 'number'
              ? null // ID not resolved, shouldn't happen with depth=2
              : (festival.organizingTuna as CMSTuna);
          if (tuna) {
            organizingTuna = {
              shortName: cleanShortName(tuna.shortName),
              fullName: tuna.fullName,
              logoUrl: getMediaUrl(tuna.logo) || undefined,
              city: tuna.city,
              website: tuna.website,
            };
          }
        }

        // Get awards for this festival
        const awards = festivalAwardsMap.get(festival.id) || [];

        // Get poster URL if available
        const posterUrl = getMediaUrl(festival.poster) || undefined;

        // Get participants for this festival
        const participants = festivalParticipantsMap.get(festival.id) || [];
        const contestants = participants
          .filter((p) => p.type === 'contestant')
          .map((p) => transformTunaWithLogo(p.tuna));
        const guests = participants
          .filter((p) => p.type === 'guest')
          .map((p) => transformTunaWithLogo(p.tuna));

        return {
          name: festival.name,
          location: festival.location || '',
          organizingTuna,
          posterUrl,
          contestants: contestants.length > 0 ? contestants : undefined,
          guests: guests.length > 0 ? guests : undefined,
          awards: awards.map((award) => {
            // Get award type info
            if (award.awardType) {
              const awardTypeId =
                typeof award.awardType === 'number'
                  ? award.awardType
                  : (award.awardType as CMSAwardType).id;
              const awardType = awardTypesMap.get(Number(awardTypeId));
              if (awardType) {
                return {
                  slug: awardType.slug,
                  name: award.customName || awardType.name,
                };
              }
            }

            // Fallback for custom awards without type
            return {
              slug: 'outro',
              name: award.customName || 'Prémio',
            };
          }),
        };
      }),
    });
  }

  // Sort by year descending
  palmaresYears.sort((a, b) => b.year - a.year);

  return palmaresYears;
}

// =============================================================================
// CONTACT INFO
// =============================================================================

export async function getContactInfo(): Promise<FrontendContactInfo> {
  const cmsContact = await client.getContactInfo();
  return {
    email: cmsContact.email,
    phone: cmsContact.phone || '',
    address: cmsContact.address?.replace(/\n/g, ', ') || '',
  };
}

// =============================================================================
// SOCIAL LINKS
// =============================================================================

export async function getSocialLinks(): Promise<FrontendSocialLinks> {
  const cmsSettings = await client.getSiteSettings();
  return {
    instagram: cmsSettings.instagram,
    facebook: cmsSettings.facebook,
    tiktok: cmsSettings.tiktok,
    youtube: cmsSettings.youtube,
    spotify: cmsSettings.spotify,
  };
}

// =============================================================================
// SITE SETTINGS
// =============================================================================

export async function getSiteSettings() {
  const settings = await client.getSiteSettings();
  return {
    siteName: settings.siteName,
    siteDescription: settings.siteDescription,
    logoUrl: getMediaUrl(settings.logo),
    faviconUrl: getMediaUrl(settings.favicon),
    socialLinks: {
      instagram: settings.instagram,
      facebook: settings.facebook,
      tiktok: settings.tiktok,
      youtube: settings.youtube,
      spotify: settings.spotify,
    },
    googleAnalyticsId: settings.googleAnalyticsId,
  };
}

// =============================================================================
// UTILITY
// =============================================================================

export async function checkCMSAvailable(): Promise<void> {
  return client.checkCMSConnection();
}
