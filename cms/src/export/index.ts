/**
 * Export CMS data to a deterministic JSON dump file.
 *
 * This dump is used by the app's fixtures as fallback when CMS is unavailable.
 * The output is sorted deterministically to avoid unnecessary diffs.
 *
 * Usage: npm run db:export
 */

// Load environment FIRST before any other imports
import 'dotenv/config';
import { config as dotenvConfig } from 'dotenv';
dotenvConfig({ path: '.env.local', override: true });

import { writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath, pathToFileURL } from 'url';
import type { Where } from 'payload';

const __dirname = dirname(fileURLToPath(import.meta.url));

/**
 * Recursively sort object keys and array elements for deterministic output.
 * Document arrays are re-sorted by id → slug → shortName → name (see ORDER-NORMALIZATION CONTRACT above).
 */
function sortDeterministic(obj: unknown): unknown {
  if (obj === null || obj === undefined) {
    return obj;
  }

  if (Array.isArray(obj)) {
    // Sort array elements, then recursively sort each element
    const sorted = obj.map((item) => sortDeterministic(item));
    // Sort arrays of objects by id, then by other common keys
    if (sorted.length > 0 && typeof sorted[0] === 'object' && sorted[0] !== null) {
      sorted.sort((a, b) => {
        const aObj = a as Record<string, unknown>;
        const bObj = b as Record<string, unknown>;
        // Try sorting by id first
        if ('id' in aObj && 'id' in bObj) {
          const aId = aObj.id;
          const bId = bObj.id;
          if (typeof aId === 'number' && typeof bId === 'number') {
            return aId - bId;
          }
          if (typeof aId === 'string' && typeof bId === 'string') {
            return aId.localeCompare(bId);
          }
        }
        // Try sorting by slug
        if ('slug' in aObj && 'slug' in bObj) {
          return String(aObj.slug).localeCompare(String(bObj.slug));
        }
        // Try sorting by shortName
        if ('shortName' in aObj && 'shortName' in bObj) {
          return String(aObj.shortName).localeCompare(String(bObj.shortName));
        }
        // Try sorting by name
        if ('name' in aObj && 'name' in bObj) {
          return String(aObj.name).localeCompare(String(bObj.name));
        }
        return 0;
      });
    }
    return sorted;
  }

  if (typeof obj === 'object') {
    // Sort object keys alphabetically
    const sortedObj: Record<string, unknown> = {};
    const keys = Object.keys(obj as Record<string, unknown>).sort();
    for (const key of keys) {
      sortedObj[key] = sortDeterministic((obj as Record<string, unknown>)[key]);
    }
    return sortedObj;
  }

  return obj;
}

interface CollectionConfig {
  slug: string;
  sort?: string;
  where?: Where;
  depth?: number;
}

/**
 * Collections to include in the CMS dump.
 *
 * ORDER-NORMALIZATION CONTRACT
 * The dump is order-normalized: after fetching, `sortDeterministic` re-sorts all
 * document arrays by id → slug → shortName → name. The dump intentionally does NOT
 * preserve the live API `sort` order (e.g. `-startDate`, `-date`). Consumers MUST
 * sort/group explicitly and must not rely on dump array order. Current consumers
 * (getPalmaresYears, getCitadaoEditions, etc.) already do this.
 *
 * PER-COLLECTION DEPTH RATIONALE
 * depth is the number of relationship levels Payload populates:
 *
 *   award-types / tunas / venues  — no depth: loop default depth = 2
 *   citadao-editions  depth: 1   — schedule embeds venues only; no deeper relationship chain read
 *   citadao-participants depth: 2 — participant → tuna → tuna.logo media
 *   citadao-awards      depth: 2 — award → tuna/awardType → media
 *   festivals           depth: 2 — festival → organizingTuna → its logo media
 *   festival-awards     depth: 2 — award → tuna/awardType → media
 *   festival-participants depth: 2 — participant → tuna → tuna.logo media; mirrors
 *                                    citadao-participants and the live getFestivalParticipants() (depth: 2)
 *   blog-posts / videos / albums / pages — no depth: loop default depth = 2
 */
export const COLLECTIONS_TO_EXPORT: CollectionConfig[] = [
  { slug: 'award-types', sort: 'slug' },
  { slug: 'tunas', sort: 'shortName' },
  { slug: 'venues', sort: 'name' },
  { slug: 'citadao-editions', sort: '-startDate', where: { status: { equals: 'published' } }, depth: 1 },
  { slug: 'citadao-participants', depth: 2 },
  { slug: 'citadao-awards', depth: 2 },
  { slug: 'festivals', sort: '-date', where: { status: { equals: 'published' } }, depth: 2 },
  { slug: 'festival-awards', depth: 2 },
  { slug: 'festival-participants', depth: 2 },
  { slug: 'blog-posts', sort: '-publishedAt', where: { status: { equals: 'published' } } },
  { slug: 'videos', sort: '-publishedAt', where: { status: { equals: 'published' } } },
  { slug: 'albums', sort: '-year', where: { status: { equals: 'published' } } },
  { slug: 'pages', where: { status: { equals: 'published' } } },
];

export const GLOBALS_TO_EXPORT = ['site-settings', 'contact-info'];

const main = async () => {
  const { getPayload } = await import('payload');
  const { default: config } = await import('../payload.config');

  console.log('Starting CMS export...');
  console.log(`Database: ${process.env.TURSO_DATABASE_URL?.substring(0, 50)}...`);

  const payload = await getPayload({ config });

  const dump: Record<string, unknown> = {
    _meta: {
      exportedAt: new Date().toISOString(),
      version: '1.0.0',
    },
    collections: {},
    globals: {},
  };

  // Export collections
  for (const collectionConfig of COLLECTIONS_TO_EXPORT) {
    const { slug, sort, where, depth = 2 } = collectionConfig;
    console.log(`  Exporting collection: ${slug}...`);

    try {
      const result = await payload.find({
        collection: slug as Parameters<typeof payload.find>[0]['collection'],
        limit: 1000,
        depth,
        sort,
        where,
      });

      (dump.collections as Record<string, unknown>)[slug] = {
        docs: result.docs,
        totalDocs: result.totalDocs,
      };

      console.log(`    Found ${result.docs.length} documents`);
    } catch (error) {
      console.error(`    Error exporting ${slug}:`, error);
      (dump.collections as Record<string, unknown>)[slug] = { docs: [], totalDocs: 0 };
    }
  }

  // Export globals
  for (const globalSlug of GLOBALS_TO_EXPORT) {
    console.log(`  Exporting global: ${globalSlug}...`);

    try {
      const result = await payload.findGlobal({
        slug: globalSlug as Parameters<typeof payload.findGlobal>[0]['slug'],
        depth: 2,
      });

      (dump.globals as Record<string, unknown>)[globalSlug] = result;
      console.log(`    Exported successfully`);
    } catch (error) {
      console.error(`    Error exporting ${globalSlug}:`, error);
      (dump.globals as Record<string, unknown>)[globalSlug] = null;
    }
  }

  // Sort everything deterministically
  const sortedDump = sortDeterministic(dump);

  // Write to file with sorted keys
  const outputPath = join(__dirname, '../../../data/cms-dump.json');
  writeFileSync(outputPath, JSON.stringify(sortedDump, null, 2) + '\n', 'utf-8');

  console.log(`\nExport completed! Written to: ${outputPath}`);

  process.exit(0);
};

const isDirectRun =
  process.argv[1] !== undefined &&
  import.meta.url === pathToFileURL(process.argv[1]).href;

if (isDirectRun) {
  main().catch((error) => {
    console.error('Export failed:', error);
    process.exit(1);
  });
}
