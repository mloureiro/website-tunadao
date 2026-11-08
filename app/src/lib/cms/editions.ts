import type { FrontendCitadaoEdition } from './types';

export function findNewestEditionWithPoster(
  editions: FrontendCitadaoEdition[]
): FrontendCitadaoEdition | undefined {
  return editions
    .filter((edition) => Boolean(edition.posterUrl))
    .reduce<
      FrontendCitadaoEdition | undefined
    >((newest, edition) => (!newest || edition.year > newest.year ? edition : newest), undefined);
}
