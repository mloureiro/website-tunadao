import { describe, expect, it } from 'vitest';
import { findNewestEditionWithPoster } from './editions';
import type { FrontendCitadaoEdition } from './types';

const edition = (year: number, posterUrl?: string) =>
  ({ year, edition: year - 2006, posterUrl }) as FrontendCitadaoEdition;

describe('findNewestEditionWithPoster', () => {
  it('falls back to the newest older edition when the newest has no poster', () => {
    const editions = [edition(2025), edition(2024, 'a.jpg'), edition(2023, 'b.jpg')];
    expect(findNewestEditionWithPoster(editions)?.year).toBe(2024);
  });

  it('returns the newest edition when it has a poster', () => {
    const editions = [edition(2025, 'c.jpg'), edition(2024, 'a.jpg')];
    expect(findNewestEditionWithPoster(editions)?.year).toBe(2025);
  });

  it('returns undefined when no edition has a poster', () => {
    expect(findNewestEditionWithPoster([edition(2025), edition(2024)])).toBeUndefined();
  });

  it('does not depend on input order', () => {
    const editions = [edition(2023, 'b.jpg'), edition(2025), edition(2024, 'a.jpg')];
    expect(findNewestEditionWithPoster(editions)?.year).toBe(2024);
  });
});
