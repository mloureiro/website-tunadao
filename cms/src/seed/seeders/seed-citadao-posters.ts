import type { Payload } from 'payload';
import { execSync } from 'child_process';
import { CITADAO_EDITIONS } from '../definitions/citadao-editions';

// Cloudinary cloud name for constructing URLs when CLI is not available
const CLOUDINARY_CLOUD_NAME = 'tunadao-site';

interface CloudinaryResource {
  asset_id: string;
  public_id: string;
  filename: string;
  format: string;
  version: number;
  resource_type: string;
  type: string;
  created_at: string;
  bytes: number;
  width: number;
  height: number;
  url: string;
  secure_url: string;
}

interface CloudinarySearchResult {
  total_count: number;
  resources: CloudinaryResource[];
}

// Extract year and edition from filename like "citadao-2024-18-poster_s7e7zj"
function parseFilename(filename: string): { year: number; edition: number } | null {
  const match = filename.match(/citadao-(\d{4})-(\d{2})-poster/);
  if (!match) return null;
  return {
    year: parseInt(match[1], 10),
    edition: parseInt(match[2], 10),
  };
}

/**
 * Create a synthetic CloudinaryResource from a full public ID.
 * This is used when the Cloudinary CLI is not available (e.g., in CI).
 */
function createSyntheticResourceFromPublicId(
  publicId: string,
  edition: number,
  year: number
): CloudinaryResource {
  const secureUrl = `https://res.cloudinary.com/${CLOUDINARY_CLOUD_NAME}/image/upload/${publicId}`;
  const url = secureUrl.replace('https://', 'http://');
  const editionStr = String(edition).padStart(2, '0');
  const filename = `citadao-${year}-${editionStr}-poster`;

  return {
    asset_id: `synthetic-citadao-${year}-${editionStr}`,
    public_id: publicId,
    filename,
    format: 'jpg',
    version: 1,
    resource_type: 'image',
    type: 'upload',
    created_at: new Date().toISOString(),
    bytes: 0,
    width: 0,
    height: 0,
    url,
    secure_url: secureUrl,
  };
}

export const seedCitadaoPosters = async (payload: Payload) => {
  console.log('  Fetching posters from Cloudinary...');

  // Fetch posters from Cloudinary using CLI (if available)
  let resources: CloudinaryResource[] = [];
  let usingSyntheticData = false;

  try {
    const result = execSync('source ~/.zshrc && cld search "folder:tunadao/citadao" -n 50', {
      encoding: 'utf-8',
      shell: '/bin/zsh',
    });
    // Extract JSON object from output (handles terminal control characters)
    const jsonMatch = result.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('No JSON found in Cloudinary output');
    }
    const cloudinaryData: CloudinarySearchResult = JSON.parse(jsonMatch[0]);
    resources = cloudinaryData.resources;
    console.log(`  Found ${cloudinaryData.total_count} posters in Cloudinary`);
  } catch {
    console.warn(
      '  Cloudinary CLI not available, using poster public IDs from edition definitions'
    );
    usingSyntheticData = true;

    // Create synthetic resources from the posterPublicId defined in each edition
    for (const edition of CITADAO_EDITIONS) {
      if (edition.posterPublicId) {
        resources.push(
          createSyntheticResourceFromPublicId(edition.posterPublicId, edition.edition, edition.year)
        );
      }
    }
    console.log(`  Created ${resources.length} synthetic poster entries`);
  }

  // Create Media entries and map to editions
  for (const resource of resources) {
    const parsed = parseFilename(resource.filename);
    if (!parsed) {
      console.log(`  Warning: Could not parse filename: ${resource.filename}`);
      continue;
    }

    try {
      // Check if media already exists by publicId
      const existingMedia = await payload.find({
        collection: 'media',
        where: {
          publicId: { equals: resource.public_id },
        },
        limit: 1,
      });

      let mediaId: string | number;

      if (existingMedia.docs.length > 0) {
        mediaId = existingMedia.docs[0].id;
        if (!usingSyntheticData) {
          console.log(`  Skipped media for ${parsed.edition}o (${parsed.year}) - already exists`);
        }
      } else {
        // Create media entry
        const media = await payload.create({
          collection: 'media',
          data: {
            filename: `citadao-${parsed.year}-${String(parsed.edition).padStart(2, '0')}-poster`,
            alt: `Cartaz do ${parsed.edition}o Citadao (${parsed.year})`,
            cloudinary: {
              asset_id: resource.asset_id,
              public_id: resource.public_id,
              format: resource.format,
              version: resource.version,
              resource_type: resource.resource_type,
              type: resource.type,
              created_at: resource.created_at,
              bytes: resource.bytes,
              width: resource.width,
              height: resource.height,
              url: resource.url,
              secure_url: resource.secure_url,
            },
          },
        });
        mediaId = media.id;
        if (!usingSyntheticData) {
          console.log(`  Created media: ${parsed.edition}o Citadao (${parsed.year})`);
        }
      }

      // Find and update the corresponding CitadaoEdition
      const edition = await payload.find({
        collection: 'citadao-editions',
        where: {
          editionNumber: { equals: parsed.edition },
        },
        limit: 1,
      });

      if (edition.docs.length > 0) {
        const doc = edition.docs[0];
        if (!doc.poster) {
          await payload.update({
            collection: 'citadao-editions',
            id: doc.id,
            data: {
              poster: mediaId,
            },
          });
          if (!usingSyntheticData) {
            console.log(`  Linked poster to ${parsed.edition}o Citadao (${parsed.year})`);
          }
        }
      } else {
        console.log(`  Warning: No CitadaoEdition found for ${parsed.edition}o (${parsed.year})`);
      }
    } catch (error) {
      console.error(`  Failed to process ${resource.filename}:`, error);
    }
  }

  if (usingSyntheticData) {
    console.log(`  Done: Created synthetic poster entries for editions 2010+`);
  }
};
