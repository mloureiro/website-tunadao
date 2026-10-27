/**
 * Cloudinary utilities - URL generation with named transformations
 */

export const CLOUDINARY_CLOUD_NAME = 'tunadao-site';

/**
 * Named transformations for posters (defined in Cloudinary)
 * @see cms/CLOUDINARY.md
 */
export const POSTER_TRANSFORMATIONS = {
  thumb: 'poster_thumb', // w_300,h_450,c_fill,g_auto,q_auto,f_auto
  medium: 'poster_medium', // w_600,h_900,c_limit,q_auto,f_auto
  full: 'poster_full', // w_1200,h_1800,c_limit,q_auto,f_auto
} as const;

export type PosterTransformation = keyof typeof POSTER_TRANSFORMATIONS;

/**
 * Poster sizes in pixels (for srcset)
 */
export const POSTER_SIZES = {
  thumb: 300,
  medium: 600,
  full: 1200,
} as const;

/**
 * Get Cloudinary URL with optional named transformation
 *
 * @param publicId - The Cloudinary public ID of the image
 * @param transformation - Optional named transformation (e.g., 'poster_thumb')
 * @returns The Cloudinary URL
 *
 * @example
 * getCloudinaryUrl('tunadao/citadao/poster_abc123', 'poster_thumb')
 * // → https://res.cloudinary.com/tunadao-site/image/upload/t_poster_thumb/tunadao/citadao/poster_abc123
 */
export function getCloudinaryUrl(publicId: string, transformation?: string): string {
  if (!publicId) return '';

  const base = `https://res.cloudinary.com/${CLOUDINARY_CLOUD_NAME}/image/upload`;

  if (transformation) {
    return `${base}/t_${transformation}/${publicId}`;
  }

  return `${base}/${publicId}`;
}

/**
 * Get poster URL with named transformation
 *
 * @param publicId - The Cloudinary public ID of the poster
 * @param size - The desired size: 'thumb', 'medium', or 'full'
 * @returns The Cloudinary URL with transformation applied
 */
export function getPosterUrl(publicId: string, size: PosterTransformation = 'medium'): string {
  return getCloudinaryUrl(publicId, POSTER_TRANSFORMATIONS[size]);
}

/**
 * Generate srcset string for responsive poster images
 *
 * @param publicId - The Cloudinary public ID of the poster
 * @returns srcset string with thumb (300w), medium (600w), and full (1200w) variants
 *
 * @example
 * getPosterSrcSet('tunadao/citadao/poster_abc123')
 * // → "https://...t_poster_thumb/... 300w, https://...t_poster_medium/... 600w, https://...t_poster_full/... 1200w"
 */
export function getPosterSrcSet(publicId: string): string {
  if (!publicId) return '';

  return Object.entries(POSTER_TRANSFORMATIONS)
    .map(([size, transformation]) => {
      const url = getCloudinaryUrl(publicId, transformation);
      const width = POSTER_SIZES[size as PosterTransformation];
      return `${url} ${width}w`;
    })
    .join(', ');
}

/**
 * Extract Cloudinary public ID from a Cloudinary URL
 *
 * @param url - A Cloudinary URL or any other URL
 * @returns The public ID if it's a Cloudinary URL, null otherwise
 *
 * @example
 * extractPublicId('https://res.cloudinary.com/tunadao-site/image/upload/v123/tunadao/poster.jpg')
 * // → 'tunadao/poster'
 */
export function extractPublicId(url: string): string | null {
  if (!url) return null;

  // Check if it's a Cloudinary URL
  const cloudinaryPattern = /res\.cloudinary\.com\/[^/]+\/image\/upload\//;
  if (!cloudinaryPattern.test(url)) return null;

  // Extract the part after /upload/ (may include version and transformations)
  const uploadMatch = url.match(/\/upload\/(?:v\d+\/)?(?:t_[^/]+\/)?(.+?)(?:\.[^.]+)?$/);
  if (!uploadMatch) return null;

  return uploadMatch[1];
}
