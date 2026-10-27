/**
 * Award utilities - Shared sorting and priority logic for awards
 */

import type { FrontendPalmaresAward, FrontendTunaWithLogo, FrontendCitadaoEdition } from './types';

/**
 * Award priority for sorting (lower = more important)
 */
export const AWARD_PRIORITY: Record<string, number> = {
  'melhor-tuna': 1,
  'tuna-mais-tuna': 2,
  'tuna-do-publico': 3,
  'segunda-melhor-tuna': 4,
  'terceira-melhor-tuna': 5,
};

/**
 * Get the priority of an award (lower is better)
 */
export function getAwardPriority(awardKey: string): number {
  return AWARD_PRIORITY[awardKey] ?? 100;
}

/**
 * Check if an award is a top prize (melhor-tuna, tuna-mais-tuna, tuna-do-publico)
 */
export function isTopPrize(awardSlug: string): boolean {
  return ['melhor-tuna', 'tuna-mais-tuna', 'tuna-do-publico'].includes(awardSlug);
}

/**
 * Sort awards by priority (palmares page)
 */
export function sortAwards(awards: FrontendPalmaresAward[]): FrontendPalmaresAward[] {
  return [...awards].sort((a, b) => {
    const aPriority = AWARD_PRIORITY[a.slug] ?? 100;
    const bPriority = AWARD_PRIORITY[b.slug] ?? 100;
    if (aPriority !== bPriority) {
      return aPriority - bPriority;
    }
    // Same priority: sort alphabetically by name
    return a.name.localeCompare(b.name, 'pt');
  });
}

/**
 * Tuna with their awards (for citadao pages)
 */
export interface TunaWithAwards {
  tuna: FrontendTunaWithLogo;
  awards: string[];
}

/**
 * Extended tuna with awards info (for year detail page)
 */
export interface TunaWithAwardsExtended extends TunaWithAwards {
  bestAwardPriority: number;
}

/**
 * Split edition tunas into those with and without prizes
 * Used by citadao/[year].astro for detailed edition view
 */
export function splitTunasByAwards(edition: FrontendCitadaoEdition): {
  withPrizes: TunaWithAwardsExtended[];
  withoutPrizes: TunaWithAwardsExtended[];
} {
  // Build map of tuna shortName -> awards
  const tunaAwardsMap = new Map<string, string[]>();
  if (edition.awards) {
    for (const [awardKey, tunaShortName] of Object.entries(edition.awards)) {
      const existing = tunaAwardsMap.get(tunaShortName) || [];
      existing.push(awardKey);
      tunaAwardsMap.set(tunaShortName, existing);
    }
  }

  // Build list with award info
  const allTunas: TunaWithAwardsExtended[] = edition.tunas.map((tuna) => {
    const awards = tunaAwardsMap.get(tuna.shortName) || [];
    const bestAwardPriority =
      awards.length > 0 ? Math.min(...awards.map((k) => AWARD_PRIORITY[k] ?? 100)) : Infinity;
    return { tuna, awards, bestAwardPriority };
  });

  // Sort: by best award priority, then alphabetically
  allTunas.sort((a, b) => {
    if (a.awards.length > 0 && b.awards.length > 0) {
      if (a.bestAwardPriority !== b.bestAwardPriority) {
        return a.bestAwardPriority - b.bestAwardPriority;
      }
    }
    if (a.awards.length > 0 && b.awards.length === 0) return -1;
    if (a.awards.length === 0 && b.awards.length > 0) return 1;
    return a.tuna.shortName.localeCompare(b.tuna.shortName, 'pt');
  });

  return {
    withPrizes: allTunas.filter((t) => t.awards.length > 0),
    withoutPrizes: allTunas.filter((t) => t.awards.length === 0),
  };
}

/**
 * Group awards by tuna (citadao index page)
 */
export function groupAwardsByTuna(edition: FrontendCitadaoEdition): TunaWithAwards[] {
  if (!edition.awards) return [];

  // Group awards by tuna shortName
  const tunaAwardsMap = new Map<string, string[]>();
  for (const [awardKey, tunaShortName] of Object.entries(edition.awards)) {
    const existing = tunaAwardsMap.get(tunaShortName) || [];
    existing.push(awardKey);
    tunaAwardsMap.set(tunaShortName, existing);
  }

  // Build list with tuna info
  const result: TunaWithAwards[] = [];
  for (const [shortName, awards] of tunaAwardsMap) {
    const tuna = edition.tunas.find((t) => t.shortName === shortName);
    if (tuna) {
      result.push({ tuna, awards });
    } else {
      // Tuna not in participants (might be guest or external)
      result.push({
        tuna: { shortName, fullName: shortName },
        awards,
      });
    }
  }

  // Sort by best award priority, then alphabetically for same priority
  result.sort((a, b) => {
    const aPriority = Math.min(...a.awards.map((k) => AWARD_PRIORITY[k] ?? 100));
    const bPriority = Math.min(...b.awards.map((k) => AWARD_PRIORITY[k] ?? 100));
    if (aPriority !== bPriority) {
      return aPriority - bPriority;
    }
    // Same priority: sort alphabetically by tuna shortName
    return a.tuna.shortName.localeCompare(b.tuna.shortName, 'pt');
  });

  return result;
}
