/**
 * Award types data for seeding.
 * slug is the unique identifier used for lookups.
 */

export interface AwardTypeData {
  name: string;
  slug: string;
  aliases: Array<{ alias: string }>;
  description: string;
}

export const AWARD_TYPES: AwardTypeData[] = [
  // === Competition Awards ===
  {
    name: 'Melhor Tuna',
    slug: 'melhor-tuna',
    aliases: [{ alias: 'Grande Premio' }, { alias: '1a Melhor Tuna' }],
    description: 'O premio maximo atribuido a tuna com melhor desempenho global no festival.',
  },
  {
    name: '2a Melhor Tuna',
    slug: 'segunda-melhor-tuna',
    aliases: [{ alias: 'Segundo Lugar' }],
    description: 'Segundo lugar na classificacao geral.',
  },
  {
    name: '3a Melhor Tuna',
    slug: 'terceira-melhor-tuna',
    aliases: [{ alias: 'Terceiro Lugar' }],
    description: 'Terceiro lugar na classificacao geral.',
  },

  // === Spirit Awards ===
  {
    name: 'Tuna Mais Tuna',
    slug: 'tuna-mais-tuna',
    aliases: [{ alias: 'Tuna + Tuna' }, { alias: 'Mais Tunante' }, { alias: 'Espirito Tunante' }],
    description:
      'Premio atribuido a tuna que melhor representa o espirito tunante - alegria, camaradagem e tradicao.',
  },
  {
    name: 'Tuna do Publico',
    slug: 'tuna-do-publico',
    aliases: [{ alias: 'Premio do Publico' }, { alias: 'Escolha do Publico' }],
    description: 'Premio votado pelo publico presente no festival.',
  },
  {
    name: 'Tuno Mais Tuninho',
    slug: 'tuno-mais-tuninho',
    aliases: [],
    description: 'Premio individual para o tuno que mais representa o espirito tunante.',
  },
  {
    name: 'Tuna Mais Marafada',
    slug: 'tuna-mais-marafada',
    aliases: [{ alias: 'Tuna + Marafada' }],
    description: 'Premio para a tuna mais marafada/divertida.',
  },
  {
    name: 'Tuna Mais Real',
    slug: 'tuna-mais-real',
    aliases: [],
    description: 'Premio para a tuna com postura mais real/nobre.',
  },
  {
    name: 'Tuna Mais Bebedora',
    slug: 'tuna-mais-bebedora',
    aliases: [{ alias: 'Tuna + Bebedoura' }],
    description: 'Premio para a tuna mais bebedora.',
  },

  // === Performance Awards ===
  {
    name: 'Melhor Serenata',
    slug: 'melhor-serenata',
    aliases: [{ alias: 'Serenata' }],
    description:
      'Premio para a melhor interpretacao de serenata, avaliando musicalidade, emocao e tecnica vocal.',
  },
  {
    name: 'Melhor Passacalles',
    slug: 'melhor-passacalles',
    aliases: [{ alias: 'Passacalles' }],
    description: 'Premio para o melhor passacalles, avaliando energia, coordenacao e animacao.',
  },
  {
    name: 'Melhor Pandeireta',
    slug: 'melhor-pandeireta',
    aliases: [{ alias: 'Pandeireta' }],
    description:
      'Premio para o melhor executante de pandeireta, avaliando tecnica, ritmo e presenca.',
  },
  {
    name: 'Melhor Instrumental',
    slug: 'melhor-instrumental',
    aliases: [{ alias: 'Instrumental' }, { alias: 'Melhor Interpretacao Musical' }],
    description: 'Premio para a melhor performance instrumental coletiva.',
  },
  {
    name: 'Melhor Solista',
    slug: 'melhor-solista',
    aliases: [{ alias: 'Solista' }],
    description: 'Premio para o melhor solista/vocalista.',
  },
  {
    name: 'Melhor Tema Original',
    slug: 'melhor-original',
    aliases: [{ alias: 'Melhor Original' }, { alias: 'Original' }],
    description: 'Premio para a melhor composicao original apresentada.',
  },

  // === Presentation Awards ===
  {
    name: 'Melhor Estandarte',
    slug: 'melhor-estandarte',
    aliases: [
      { alias: 'Estandarte' },
      { alias: 'Melhor Bandeira' },
      { alias: 'Melhor Porta-Estandarte' },
      { alias: 'Porta-Estandarte' },
    ],
    description: 'Premio para o estandarte/bandeira mais bonito e bem apresentado.',
  },

  // === Special Awards ===
  {
    name: 'Mencao Honrosa',
    slug: 'mencao-honrosa',
    aliases: [],
    description: 'Mencao especial de reconhecimento.',
  },
  {
    name: 'Premio Ibero-Americano',
    slug: 'premio-ibero-americano',
    aliases: [],
    description: 'Premio especial para tunas de paises ibero-americanos.',
  },
  {
    name: 'Premio de Participacao',
    slug: 'premio-participacao',
    aliases: [],
    description: 'Premio simbolico pela participacao no festival.',
  },
  {
    name: 'Premio Tema Especial',
    slug: 'premio-tema-especial',
    aliases: [{ alias: 'Premio Tema Cabaret' }],
    description: 'Premio para a melhor interpretacao do tema especial do festival.',
  },
];

/**
 * Lookup map for fast access by slug
 */
export const AWARD_TYPE_BY_SLUG = new Map<string, AwardTypeData>(
  AWARD_TYPES.map((award) => [award.slug, award])
);
