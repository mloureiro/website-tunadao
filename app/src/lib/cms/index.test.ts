/**
 * Unit tests for getMediaUrl and pure transform helpers in index.ts
 *
 * CMS_URL defaults to 'http://localhost:3000' in Vitest (import.meta.env.CMS_URL
 * is undefined → falls back to the hardcoded default in index.ts).
 */

import { describe, it, expect } from 'vitest';
import { getMediaUrl, cleanShortName, extractSpotifyAlbumId, formatDateRange } from './index';

const CMS_BASE = 'http://localhost:3000';

describe('getMediaUrl()', () => {
  it('returns empty string for null', () => {
    expect(getMediaUrl(null)).toBe('');
  });

  it('returns empty string for undefined', () => {
    expect(getMediaUrl(undefined)).toBe('');
  });

  it('returns empty string for empty string', () => {
    expect(getMediaUrl('')).toBe('');
  });

  it('constructs URL for a numeric id', () => {
    expect(getMediaUrl(42)).toBe(`${CMS_BASE}/media/42`);
  });

  it('returns absolute string unchanged', () => {
    expect(getMediaUrl('https://res.cloudinary.com/img/upload/sample.jpg')).toBe(
      'https://res.cloudinary.com/img/upload/sample.jpg'
    );
  });

  it('returns root-relative string unchanged', () => {
    expect(getMediaUrl('/uploads/poster.png')).toBe('/uploads/poster.png');
  });

  it('constructs URL for a bare string id', () => {
    expect(getMediaUrl('abc123')).toBe(`${CMS_BASE}/media/abc123`);
  });

  it('prefixes CMS base to a CMSMedia object with relative url', () => {
    const media = { id: 1, url: '/media/poster.jpg', filename: 'poster.jpg', alt: '' };
    expect(getMediaUrl(media)).toBe(`${CMS_BASE}/media/poster.jpg`);
  });

  it('returns absolute url from CMSMedia object unchanged', () => {
    const media = {
      id: 2,
      url: 'https://cdn.example.com/image.jpg',
      filename: 'image.jpg',
      alt: '',
    };
    expect(getMediaUrl(media)).toBe('https://cdn.example.com/image.jpg');
  });

  it('returns empty string for CMSMedia object with no url', () => {
    const media = { id: 3, filename: 'unknown.jpg', alt: '' };
    expect(getMediaUrl(media)).toBe('');
  });
});

describe('cleanShortName()', () => {
  it('strips timestamp suffix and uppercases the slug part', () => {
    expect(cleanShortName('eul-1769429567906')).toBe('EUL');
  });

  it('returns the value unchanged when no timestamp suffix is present', () => {
    // No slug-timestamp pattern → returned as-is (not uppercased)
    expect(cleanShortName('TUM')).toBe('TUM');
  });
});

describe('extractSpotifyAlbumId()', () => {
  it('extracts the album id from a full Spotify album URL', () => {
    expect(extractSpotifyAlbumId('https://open.spotify.com/album/5ljVRcZan9DLkFDm5aWAgt')).toBe(
      '5ljVRcZan9DLkFDm5aWAgt'
    );
  });

  it('returns undefined for undefined input', () => {
    expect(extractSpotifyAlbumId(undefined)).toBeUndefined();
  });

  it('returns undefined for a URL with no album segment', () => {
    expect(extractSpotifyAlbumId('https://example.com/not-an-album')).toBeUndefined();
  });
});

describe('formatDateRange()', () => {
  it('formats a single-day date as "D Month" with capitalized month', () => {
    // 2024-05-04 same start and end → "4 Maio"
    expect(formatDateRange('2024-05-04', '2024-05-04')).toBe('4 Maio');
  });

  it('formats a date range as "D1-D2 Month" with capitalized month', () => {
    // 2024-05-04 to 2024-05-06 → "4-6 Maio"
    expect(formatDateRange('2024-05-04', '2024-05-06')).toBe('4-6 Maio');
  });
});
