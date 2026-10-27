import type { Payload } from 'payload';
import { CITADAO_EDITIONS } from '../definitions/citadao-editions';
import { TunaRegistry } from '../utils/tuna-registry';
import { AwardRegistry } from '../utils/award-registry';

/**
 * Parse date string to ISO date (assumes Portuguese format)
 */
function parseDateRange(
  dateStr: string | null,
  year: number
): { startDate: string; endDate: string } {
  if (!dateStr) {
    // Default to May 1st for unknown dates
    return {
      startDate: `${year}-05-01`,
      endDate: `${year}-05-01`,
    };
  }

  const months: Record<string, string> = {
    janeiro: '01',
    fevereiro: '02',
    marco: '03',
    abril: '04',
    maio: '05',
    junho: '06',
    julho: '07',
    agosto: '08',
    setembro: '09',
    outubro: '10',
    novembro: '11',
    dezembro: '12',
  };

  const normalized = dateStr
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');

  // Find month
  let month = '05'; // default to May
  for (const [name, num] of Object.entries(months)) {
    const normalizedMonth = name.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    if (normalized.includes(normalizedMonth)) {
      month = num;
      break;
    }
  }

  // Extract days (handles "4-5", "29-30", "4 Maio", etc.)
  const dayMatch = normalized.match(/(\d+)(?:\s*-\s*(\d+))?/);
  let startDay = '01';
  let endDay = '01';

  if (dayMatch) {
    startDay = dayMatch[1].padStart(2, '0');
    endDay = (dayMatch[2] || dayMatch[1]).padStart(2, '0');
  }

  return {
    startDate: `${year}-${month}-${startDay}`,
    endDate: `${year}-${month}-${endDay}`,
  };
}

/**
 * Normalize venue name for slug generation
 */
function normalizeForSlug(name: string): string {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

/**
 * Extract all unique venue names from citadao editions
 */
function extractAllVenueNames(): Set<string> {
  const names = new Set<string>();
  for (const edition of CITADAO_EDITIONS) {
    edition.venues.forEach((v) => names.add(v));
  }
  return names;
}

/**
 * Seed Citadao editions using the registries for lookups.
 */
export const seedCitadaoEditions = async (
  payload: Payload,
  tunaRegistry: TunaRegistry,
  awardRegistry: AwardRegistry
) => {
  // Cache for venues: normalized name -> id
  const venueCache = new Map<string, string>();

  // 1. Create venues
  console.log('\n  Creating venues...');
  const allVenueNames = extractAllVenueNames();
  for (const venueName of allVenueNames) {
    const normalizedKey = normalizeForSlug(venueName);

    // Check if exists
    const existing = await payload.find({
      collection: 'venues',
      where: { name: { equals: venueName } },
      limit: 1,
    });

    if (existing.docs.length > 0) {
      venueCache.set(normalizedKey, existing.docs[0].id);
      console.log(`    Skipped venue "${venueName}" - already exists`);
    } else {
      const venue = await payload.create({
        collection: 'venues',
        data: { name: venueName },
      });
      venueCache.set(normalizedKey, venue.id);
      console.log(`    Created venue: ${venueName}`);
    }
  }

  // 2. Create editions, participants and awards
  console.log('\n  Creating Citadao editions...');
  for (const edition of CITADAO_EDITIONS) {
    try {
      // Check if edition exists
      const existing = await payload.find({
        collection: 'citadao-editions',
        where: { editionNumber: { equals: edition.edition } },
        limit: 1,
      });

      let editionId: string;

      if (existing.docs.length > 0) {
        editionId = existing.docs[0].id;
        console.log(`    Skipped Citadao ${edition.edition}o (${edition.year}) - already exists`);
      } else {
        const { startDate, endDate } = parseDateRange(edition.date, edition.year);

        // Build schedule array
        const schedule: Array<{ date: string; venue: string }> = [];
        for (const venueName of edition.venues) {
          const venueId = venueCache.get(normalizeForSlug(venueName));
          if (venueId) {
            schedule.push({ date: startDate, venue: venueId });
          }
        }

        const newEdition = await payload.create({
          collection: 'citadao-editions',
          data: {
            editionNumber: edition.edition,
            startDate,
            endDate,
            schedule,
            notes: edition.notes || '',
            status: 'published',
          },
        });
        editionId = newEdition.id;
        console.log(`    Created Citadao ${edition.edition}o (${edition.year})`);
      }

      // 3. Create participants (contestants)
      for (const tunaShortName of edition.tunas) {
        try {
          const tunaId = tunaRegistry.getTunaId(tunaShortName);

          // Check if participant exists
          const existingParticipant = await payload.find({
            collection: 'citadao-participants',
            where: {
              and: [{ edition: { equals: editionId } }, { tuna: { equals: tunaId } }],
            },
            limit: 1,
          });

          if (existingParticipant.docs.length === 0) {
            await payload.create({
              collection: 'citadao-participants',
              data: {
                edition: editionId,
                tuna: tunaId,
                type: 'contestant',
              },
            });
          }
        } catch (error) {
          const msg = error instanceof Error ? error.message : String(error);
          console.error(`      Error adding contestant "${tunaShortName}": ${msg}`);
        }
      }

      // 4. Create participants (guests)
      for (const tunaShortName of edition.guests) {
        try {
          const tunaId = tunaRegistry.getTunaId(tunaShortName);

          const existingParticipant = await payload.find({
            collection: 'citadao-participants',
            where: {
              and: [{ edition: { equals: editionId } }, { tuna: { equals: tunaId } }],
            },
            limit: 1,
          });

          if (existingParticipant.docs.length === 0) {
            await payload.create({
              collection: 'citadao-participants',
              data: {
                edition: editionId,
                tuna: tunaId,
                type: 'guest',
              },
            });
          }
        } catch (error) {
          const msg = error instanceof Error ? error.message : String(error);
          console.error(`      Error adding guest "${tunaShortName}": ${msg}`);
        }
      }

      // 5. Create awards
      if (edition.awards) {
        for (const [awardSlug, winnerShortName] of Object.entries(edition.awards)) {
          if (!winnerShortName) continue;

          try {
            const awardTypeId = awardRegistry.getAwardId(awardSlug);
            const tunaId = tunaRegistry.getTunaId(winnerShortName);

            // Check if award exists
            const existingAward = await payload.find({
              collection: 'citadao-awards',
              where: {
                and: [{ edition: { equals: editionId } }, { award: { equals: awardTypeId } }],
              },
              limit: 1,
            });

            if (existingAward.docs.length === 0) {
              await payload.create({
                collection: 'citadao-awards',
                data: {
                  edition: editionId,
                  award: awardTypeId,
                  tuna: tunaId,
                },
              });
            }
          } catch (error) {
            const msg = error instanceof Error ? error.message : String(error);
            console.error(
              `      Error adding award "${awardSlug}" -> "${winnerShortName}": ${msg}`
            );
          }
        }
      }
    } catch (error) {
      console.error(`    Failed to create Citadao ${edition.edition}o:`, error);
    }
  }
};
