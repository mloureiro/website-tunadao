import type { Payload } from 'payload';
import { FESTIVALS } from '../definitions/festivals';
import { TunaRegistry } from '../utils/tuna-registry';
import { AwardRegistry } from '../utils/award-registry';

/**
 * Seed Festivals, FestivalAwards, and FestivalParticipants using the registries for lookups.
 */
export const seedFestivals = async (
  payload: Payload,
  tunaRegistry: TunaRegistry,
  awardRegistry: AwardRegistry
): Promise<void> => {
  console.log('\n  Seeding Festivals...');

  for (const festivalData of FESTIVALS) {
    try {
      // Check if festival already exists
      const existing = await payload.find({
        collection: 'festivals',
        where: {
          name: { equals: festivalData.name },
        },
        limit: 1,
      });

      let festivalId: string;

      if (existing.docs.length > 0) {
        festivalId = existing.docs[0].id;
        console.log(`    Skipped Festival "${festivalData.name}" - already exists`);
      } else {
        // Get organizing tuna ID if specified
        let organizingTunaId: number | null = null;
        if (festivalData.organizingTuna) {
          const id = tunaRegistry.tryGetTunaId(festivalData.organizingTuna);
          if (id) {
            organizingTunaId = id;
          } else {
            console.log(
              `      Warning: Organizing tuna "${festivalData.organizingTuna}" not found for ${festivalData.name}`
            );
          }
        }

        // Create the festival
        const festival = await payload.create({
          collection: 'festivals',
          data: {
            name: festivalData.name,
            date: festivalData.date,
            location: festivalData.location || '',
            organizingTuna: organizingTunaId,
            status: 'published',
          },
        });

        festivalId = festival.id;
        console.log(`    Created Festival: ${festivalData.name}`);

        // Create festival awards
        for (const award of festivalData.awards) {
          let awardTypeId: number | null = null;
          try {
            awardTypeId = awardRegistry.getAwardId(award.slug);
          } catch {
            console.log(
              `      Warning: Award type "${award.slug}" not found for ${festivalData.name}`
            );
          }

          await payload.create({
            collection: 'festival-awards',
            data: {
              festival: festivalId,
              awardType: awardTypeId,
              customName: award.customNote || '',
            },
          });
        }

        if (festivalData.awards.length > 0) {
          console.log(`      Created ${festivalData.awards.length} awards`);
        }
      }

      // Create festival participants
      // Always add Tunadao1998 as contestant for every festival
      await createParticipantIfNotExists(
        payload,
        festivalId,
        tunaRegistry.getTunaId('Tunadao1998'),
        'contestant'
      );

      // Create contestant records from tunas[]
      if (festivalData.tunas) {
        for (const tunaShortName of festivalData.tunas) {
          try {
            const tunaId = tunaRegistry.getTunaId(tunaShortName);
            await createParticipantIfNotExists(payload, festivalId, tunaId, 'contestant');
          } catch (error) {
            const msg = error instanceof Error ? error.message : String(error);
            console.error(`      Error adding contestant "${tunaShortName}": ${msg}`);
          }
        }
      }

      // Create guest records from guests[]
      if (festivalData.guests) {
        for (const tunaShortName of festivalData.guests) {
          try {
            const tunaId = tunaRegistry.getTunaId(tunaShortName);
            await createParticipantIfNotExists(payload, festivalId, tunaId, 'guest');
          } catch (error) {
            const msg = error instanceof Error ? error.message : String(error);
            console.error(`      Error adding guest "${tunaShortName}": ${msg}`);
          }
        }
      }

      // Log participant count
      const hasParticipants = festivalData.tunas || festivalData.guests;
      if (hasParticipants) {
        const contestantCount = (festivalData.tunas?.length || 0) + 1; // +1 for Tunadao
        const guestCount = festivalData.guests?.length || 0;
        console.log(`      Participants: ${contestantCount} contestants, ${guestCount} guests`);
      }
    } catch (error) {
      console.error(`    Failed to create Festival "${festivalData.name}":`, error);
    }
  }
};

/**
 * Create a festival participant record if it doesn't already exist.
 * Dedup by festival + tuna composite key.
 */
async function createParticipantIfNotExists(
  payload: Payload,
  festivalId: string,
  tunaId: string,
  type: 'contestant' | 'guest'
): Promise<void> {
  const existing = await payload.find({
    collection: 'festival-participants',
    where: {
      and: [{ festival: { equals: festivalId } }, { tuna: { equals: tunaId } }],
    },
    limit: 1,
  });

  if (existing.docs.length === 0) {
    await payload.create({
      collection: 'festival-participants',
      data: {
        festival: festivalId,
        tuna: tunaId,
        type,
      },
    });
  }
}
