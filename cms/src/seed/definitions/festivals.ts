/**
 * Festivals data for seeding.
 * Transformed from the old palmares-years structure.
 */

export interface FestivalAwardData {
  /** Award type slug from award-types.ts */
  slug: string;
  /** Custom note/variation */
  customNote?: string;
}

export interface FestivalData {
  name: string;
  /** Date in YYYY-MM-DD format (day can be approximate, usually we know the year) */
  date: string;
  location: string | null;
  /** Organizing tuna shortName (null if unknown) */
  organizingTuna: string | null;
  /** Cloudinary public ID for the festival poster */
  posterPublicId?: string;
  awards: FestivalAwardData[];
  /** Tuna shortNames competing ("a concurso"). undefined = no data available. */
  tunas?: string[];
  /** Tuna shortNames as guests ("extra concurso"). undefined = no data available. */
  guests?: string[];
}

/**
 * Mapping of festival name patterns to organizing tuna shortNames
 */
export const FESTIVAL_ORGANIZERS: Record<string, string> = {
  // Aveiro
  fitua: 'TUA',
  festilha: 'TUA',
  // Braga
  'fitu bracara': 'TUM',
  celta: 'Azeituna',
  // Guimaraes
  'cidade berco': 'Afonsina',
  'cidade de berco': 'Afonsina',
  // Castelo Branco
  fitucb: 'EACB',
  // Coimbra
  festuna: 'EUC',
  'cantar de estudante': 'TMUC',
  // Guarda
  oppidana: "Copituna d'Oppidana",
  // Castelo Branco - FITAs
  fitas: 'Castra Leuca',
  // Coimbra - Queima das Fitas
  fitqfc: 'QFC',
  // Barcelos
  'barca celi': 'TAIPCA',
  // Viana do Castelo
  lethes: 'Hinoportuna',
  // Leiria
  collipo: 'Trovantina',
  // Covilha
  herminius: 'Tuna-MUs',
  festubi: 'Desertuna',
  // Porto
  fitisep: 'TAISEP',
  fetuf: 'TFISCAP',
  portuscalle: 'TEUP',
  fitup: 'TAUP',
  'fitu cidade do porto': 'OUP',
  padrecos: 'TUCP',
  'noites de ronda': 'TMP',
  alcatraz: 'Gatunos',
  alcatr: 'Gatunos',
  fardas: 'TAEP',
  // Acores
  ciclone: 'TUSA',
  'el acor': 'Tunideos',
  // Faro
  fartuna: 'Versus Tuna',
  // Figueira da Foz
  fituff: 'Bruna',
  fitaff: 'Imperial Neptuna',
  fituiff: 'Bruna',
  // Braganca
  fitab: 'RTUB',
  // Beja
  'terras de cante': 'TUB',
  'terra de cante': 'TUB',
  'fital pax julia': 'Semper Tesus',
  // Lisboa
  estudantino: 'Estudantina ISEL',
  // Tomar
  templario: 'Tuna Templaria',
  // Setubal
  'por terras do sado': 'TASCA',
  // Madeira
  'festival internacional de tunas do atlantico': 'TUM-Madeira',
  // Santarem
  centup: 'Scalabituna',
  // Lamego
  fitul: 'Estudantina Lamego',
};

/**
 * Find organizing tuna shortName from festival name
 */
export function findOrganizingTunaShortName(festivalName: string): string | null {
  const normalized = festivalName
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');

  for (const [pattern, shortName] of Object.entries(FESTIVAL_ORGANIZERS)) {
    const normalizedPattern = pattern
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '');
    if (normalized.includes(normalizedPattern)) {
      return shortName;
    }
  }
  return null;
}

/**
 * All festivals from Tunadao's history.
 * Date format: YYYY-MM-DD (using June 15 as default when only year is known)
 */
export const FESTIVALS: FestivalData[] = [
  // 2025
  {
    name: 'XXXIV FITU Bracara Augusta',
    date: '2025-05-22',
    location: 'Braga',
    organizingTuna: 'TUM',
    awards: [{ slug: 'melhor-passacalles' }],
  },
  // 2024
  {
    name: 'XV Ciclone',
    date: '2024-04-15',
    location: 'Angra do Heroismo',
    organizingTuna: 'TUSA',
    awards: [{ slug: 'tuna-mais-tuna', customNote: 'Premio Mestre Tuso' }],
  },
  {
    name: 'XVIII Cidade Berco',
    date: '2024-03-01',
    location: 'Guimaraes',
    organizingTuna: 'Afonsina',
    posterPublicId: 'tunadao/festivais/xviii-cidade-berco-2024',
    awards: [],
    tunas: ['TAL', 'Luz&Tuna', 'Desertuna', 'GATUNA', 'SINA', 'TunObebes', 'TunaoMinho'],
    guests: ['Afonsina'],
  },
  // 2023
  {
    name: 'VIII Herminius',
    date: '2023-05-26',
    location: 'Covilha',
    organizingTuna: 'Tuna-MUs',
    awards: [{ slug: 'melhor-pandeireta' }, { slug: 'tuna-mais-tuna' }],
  },
  // 2022
  {
    name: 'VII FITUL Cidade de Lamego',
    date: '2022-11-04',
    location: 'Lamego',
    organizingTuna: 'Estudantina Lamego',
    awards: [
      { slug: 'melhor-passacalles' },
      { slug: 'melhor-estandarte' },
      { slug: 'tuna-mais-tuna' },
    ],
  },
  {
    name: 'XVI Cidade Berco',
    date: '2022-03-15',
    location: 'Guimaraes',
    organizingTuna: 'Afonsina',
    awards: [
      { slug: 'melhor-tuna' },
      { slug: 'melhor-instrumental' },
      { slug: 'melhor-original' },
      { slug: 'melhor-instrumental', customNote: 'Melhor Prestacao Musical' },
      { slug: 'tuna-mais-tuna' },
    ],
  },
  // 2019
  {
    name: 'XXIX FITUA',
    date: '2019-04-12',
    location: 'Aveiro',
    organizingTuna: 'TUA',
    posterPublicId: 'tunadao/festivais/xxix-fitua-2019',
    awards: [
      { slug: 'melhor-instrumental' },
      { slug: 'melhor-tuna' },
      { slug: 'tuna-mais-bebedora' },
    ],
    tunas: ['anTUNiA', "Copituna d'Oppidana", 'Azeituna', 'TunaNavarra'],
    guests: ['ButchersBrassBand', 'TFAAUAV', 'TunaVeteranaAveiro'],
  },
  {
    name: 'XXIX FITU Bracara Augusta',
    date: '2019-04-05',
    location: 'Braga',
    organizingTuna: 'TUM',
    posterPublicId: 'tunadao/festivais/xxix-fitu-bracara-augusta-2019',
    awards: [{ slug: 'tuna-do-publico' }, { slug: 'melhor-pandeireta' }, { slug: 'melhor-tuna' }],
    tunas: ['TMP', 'TunaTS', 'EUL', 'TUIST', 'TunaDerechoAlicante'],
    guests: ['Azeituna'],
  },
  {
    name: 'XIII FITUCB',
    date: '2019-11-01',
    location: 'Castelo Branco',
    organizingTuna: 'EACB',
    posterPublicId: 'tunadao/festivais/xiii-fitucb-2019',
    awards: [{ slug: 'melhor-estandarte' }, { slug: 'segunda-melhor-tuna' }],
    tunas: ['anTUNiA', 'TEUP', 'TUIST'],
    guests: ['ArtintunaCopitusa', 'DArtatuna', 'TUSALBI', 'TUSALD', 'TFA'],
  },
  // 2018
  {
    name: 'XXVIII Festuna',
    date: '2018-11-02',
    location: 'Coimbra',
    organizingTuna: 'EUC',
    posterPublicId: 'tunadao/festivais/xxviii-festuna-2018',
    awards: [{ slug: 'segunda-melhor-tuna' }, { slug: 'melhor-pandeireta' }],
  },
  {
    name: 'XIII Cidade de Berco',
    date: '2018-03-04',
    location: 'Guimaraes',
    organizingTuna: 'Afonsina',
    posterPublicId: 'tunadao/festivais/xiii-cidade-de-berco-2018',
    awards: [
      { slug: 'melhor-solista' },
      { slug: 'melhor-instrumental' },
      { slug: 'tuna-mais-tuna' },
      { slug: 'melhor-instrumental', customNote: 'Melhor Interpretacao Musical' },
      { slug: 'melhor-tuna' },
      { slug: 'melhor-serenata' },
    ],
    tunas: ['EACB', 'Luz&Tuna', 'Oportuna'],
    guests: ['TUM'],
  },
  // 2017
  {
    name: 'XVI Oppidana',
    date: '2017-03-11',
    location: 'Guarda',
    organizingTuna: "Copituna d'Oppidana",
    posterPublicId: 'tunadao/festivais/xvi-oppidana-2017',
    awards: [{ slug: 'tuna-mais-tuna' }],
    tunas: ['TUA', 'TMP', 'EACB'],
    guests: ['AMeiaNoite'],
  },
  {
    name: 'XII Barca Celi',
    date: '2017-11-03',
    location: 'Barcelos',
    organizingTuna: 'TAIPCA',
    posterPublicId: 'tunadao/festivais/xii-barca-celi-2017',
    awards: [{ slug: 'melhor-original' }, { slug: 'melhor-tuna' }],
    tunas: ['Azeituna', 'TunaTS', 'Scalabituna'],
    guests: ['TFIPCA'],
  },
  {
    name: 'XXVII FITU Bracara Augusta',
    date: '2017-03-31',
    location: 'Braga',
    organizingTuna: 'TUM',
    posterPublicId: 'tunadao/festivais/xxvii-fitu-bracara-augusta-2017',
    awards: [{ slug: 'melhor-pandeireta' }, { slug: 'terceira-melhor-tuna' }],
    tunas: ['TMP', 'TUA', 'TUCP', 'TMUC', 'anTUNiA', 'TunaDerechoValladolid'],
    guests: ['Azeituna', 'Jogralhos'],
  },
  {
    name: 'XVII Lethes',
    date: '2017-04-07',
    location: 'Viana do Castelo',
    organizingTuna: 'Hinoportuna',
    posterPublicId: 'tunadao/festivais/xvii-lethes-2017',
    awards: [],
    tunas: ['EUC', 'TUM', 'anTUNiA'],
    guests: ['TUNICE', 'OUP'],
  },
  {
    name: 'IX Cantar de Estudante',
    date: '2017-11-23',
    location: 'Coimbra',
    organizingTuna: 'TMUC',
    posterPublicId: 'tunadao/festivais/ix-cantar-de-estudante-2017',
    awards: [{ slug: 'tuna-mais-tuna' }, { slug: 'tuna-do-publico' }],
  },
  // 2016
  {
    name: 'VII Collipo',
    date: '2016-03-05',
    location: 'Leiria',
    organizingTuna: 'Trovantina',
    posterPublicId: 'tunadao/festivais/vii-collipo-2016',
    awards: [
      { slug: 'melhor-passacalles' },
      { slug: 'tuna-mais-tuna' },
      { slug: 'tuna-do-publico' },
      { slug: 'melhor-solista' },
    ],
    tunas: ['TAIPCA', 'Tuna Templaria', 'TunaTS'],
    guests: ['Trovantina'],
  },
  // NOTE: Poster shows tuna emblems on traje (uncertain identification).
  // Visible emblems: TMP, Tunadao1998, TunaMagisterioCaceres, TunaPonferrada,
  // TunaDerechoUNAM, Desertuna, TunaEngBeja.
  // Not adding participant arrays due to low confidence.
  {
    name: 'XXVI FITU Bracara Augusta',
    date: '2016-04-10',
    location: 'Braga',
    organizingTuna: 'TUM',
    posterPublicId: 'tunadao/festivais/xxvi-fitu-bracara-augusta-2016',
    awards: [
      { slug: 'premio-ibero-americano' },
      { slug: 'tuna-mais-tuna' },
      { slug: 'melhor-pandeireta' },
      { slug: 'melhor-estandarte' },
      { slug: 'melhor-tuna' },
    ],
  },
  // 2015
  {
    name: 'VI Collipo',
    date: '2015-03-14',
    location: 'Leiria',
    organizingTuna: 'Trovantina',
    posterPublicId: 'tunadao/festivais/vi-collipo-2015',
    awards: [{ slug: 'melhor-tuna' }, { slug: 'melhor-serenata' }, { slug: 'tuna-do-publico' }],
    tunas: ['TAUE', 'TAL', 'Versus Tuna'],
    guests: ['AteneuLeiria'],
  },
  {
    name: 'III Herminius',
    date: '2015-04-11',
    location: 'Covilha',
    organizingTuna: 'Tuna-MUs',
    posterPublicId: 'tunadao/festivais/iii-herminius-2015',
    awards: [{ slug: 'melhor-tuna' }, { slug: 'melhor-serenata' }, { slug: 'tuna-do-publico' }],
    tunas: ['EACB', 'Luz&Tuna', 'TMP'],
    guests: [],
  },
  {
    name: 'IX FITUCB',
    date: '2015-11-20',
    location: 'Castelo Branco',
    organizingTuna: 'EACB',
    posterPublicId: 'tunadao/festivais/ix-fitucb-2015',
    awards: [
      { slug: 'melhor-instrumental' },
      { slug: 'tuna-mais-tuna' },
      { slug: 'segunda-melhor-tuna' },
      { slug: 'melhor-estandarte', customNote: 'Premio Rui Truta Gil' },
    ],
    tunas: ['FAN-Farra', 'TAIPCA', "Copituna d'Oppidana"],
    guests: ['ArtintunaCopitusa', 'GrupoFadosEACB', 'TUSALBI', 'EACB', 'SonsDeBeiroa'],
  },
  {
    name: 'VII Cantar de Estudante',
    date: '2015-11-27',
    location: 'Coimbra',
    organizingTuna: 'TMUC',
    posterPublicId: 'tunadao/festivais/vii-cantar-de-estudante-2015',
    awards: [{ slug: 'tuna-mais-tuna' }, { slug: 'tuna-do-publico' }],
  },
  // 2014
  {
    name: 'XI FITUFF',
    date: '2014-03-15',
    location: 'Figueira da Foz',
    organizingTuna: 'Bruna',
    posterPublicId: 'tunadao/festivais/xi-fituff-2014',
    awards: [{ slug: 'premio-participacao' }],
    tunas: ['TUA', 'TMP', 'Hinoportuna'],
    guests: ['Bruna'],
  },
  {
    name: 'XIX Alcatraz',
    date: '2014-04-04',
    location: 'Vila do Conde',
    organizingTuna: 'Gatunos',
    posterPublicId: 'tunadao/festivais/xix-alcatraz-2014',
    awards: [{ slug: 'melhor-tuna' }],
    tunas: ['TAB', 'TAIPCA', 'TunaMedicinaBadajoz', 'TunaContabilidadePorto'],
    guests: ['Afrodituna', 'EduardoRebelo'],
  },
  {
    name: 'IX Barca Celi',
    date: '2014-11-07',
    location: 'Barcelos',
    organizingTuna: 'TAIPCA',
    posterPublicId: 'tunadao/festivais/ix-barca-celi-2014',
    awards: [
      { slug: 'segunda-melhor-tuna' },
      { slug: 'melhor-serenata' },
      { slug: 'melhor-instrumental' },
      { slug: 'melhor-estandarte' },
      { slug: 'melhor-solista' },
      { slug: 'tuna-mais-tuna' },
    ],
    tunas: ['Azeituna', "Copituna d'Oppidana", 'Gatunos', 'Hinoportuna'],
    guests: ['TFIPCA'],
  },
  {
    name: 'XXI Celta',
    date: '2014-12-12',
    location: 'Braga',
    organizingTuna: 'Azeituna',
    posterPublicId: 'tunadao/festivais/xxi-celta-2014',
    awards: [{ slug: 'melhor-instrumental' }],
    tunas: ['TUIST', 'EUL', 'TUCP', 'Scalabituna', 'Desertuna', 'TEUP'],
    guests: ['TUM', 'Azeituna'],
  },
  // 2013
  {
    name: 'Portuscalle 13',
    date: '2013-10-26',
    location: 'Porto',
    organizingTuna: 'TEUP',
    posterPublicId: 'tunadao/festivais/portuscalle-13-2013',
    awards: [{ slug: 'tuna-mais-tuna' }],
    tunas: ['TUCP', 'Magna Tuna Cartola', 'TMP'],
    guests: ['TUNAFE', 'TUP'],
  },
  {
    name: 'XXIII FITU Bracara Augusta',
    date: '2013-04-12',
    location: 'Braga',
    organizingTuna: 'TUM',
    posterPublicId: 'tunadao/festivais/xxiii-fitu-bracara-augusta-2013',
    awards: [
      { slug: 'terceira-melhor-tuna' },
      { slug: 'tuna-mais-tuna' },
      { slug: 'melhor-pandeireta' },
    ],
    tunas: ['EUC', 'TUCP', 'TunaMedicinaBadajoz', 'TMP', 'TUIST'],
    guests: ['Afonsina', 'Azeituna'],
  },
  {
    name: 'IX Ciclone',
    date: '2013-03-15',
    location: 'Angra do Heroismo',
    organizingTuna: 'TUSA',
    posterPublicId: 'tunadao/festivais/ix-ciclone-2013',
    awards: [{ slug: 'melhor-tuna' }, { slug: 'melhor-original' }, { slug: 'melhor-pandeireta' }],
    tunas: ['Versus Tuna', 'TunaTS', 'TAFUL', 'Bagatuna'],
    guests: ['TUSA'],
  },
  // 2012
  {
    name: 'XIX FITISEP',
    date: '2012-11-23',
    location: 'Porto',
    organizingTuna: 'TAISEP',
    posterPublicId: 'tunadao/festivais/xix-fitisep-2012',
    awards: [{ slug: 'segunda-melhor-tuna' }, { slug: 'melhor-estandarte' }],
    tunas: ['Afonsina', 'TunaLusiadaFamalicao', 'TunaAgricolasSevilla', 'TMP'],
    guests: ['TunaFemininaISEP'],
  },
  {
    name: 'Padrecos 2012',
    date: '2012-06-15',
    location: 'Porto',
    organizingTuna: 'TUCP',
    awards: [
      { slug: 'melhor-tuna' },
      { slug: 'tuna-mais-tuna' },
      { slug: 'melhor-pandeireta' },
      { slug: 'melhor-estandarte' },
    ],
  },
  {
    name: 'X Festubi',
    date: '2012-04-14',
    location: 'Covilha',
    organizingTuna: 'Desertuna',
    posterPublicId: 'tunadao/festivais/x-festubi-2012',
    awards: [{ slug: 'tuno-mais-tuninho', customNote: 'Luis Filipe (BOOBOO)' }],
    tunas: ['TunaTS', 'TUM', 'Tunideos'],
    guests: ['Fado Livre'],
  },
  {
    name: 'XII Lethes',
    date: '2012-03-16',
    location: 'Viana do Castelo',
    organizingTuna: 'Hinoportuna',
    posterPublicId: 'tunadao/festivais/xii-lethes-2012',
    awards: [{ slug: 'melhor-pandeireta' }, { slug: 'tuna-mais-tuna' }],
    tunas: ['TEUP', 'TMUC', 'Azeituna', 'TUIST'],
    guests: ['TunaVeteranosViana'],
  },
  {
    name: 'I Noites de Ronda',
    date: '2012-03-09',
    location: 'Porto',
    organizingTuna: 'TMP',
    posterPublicId: 'tunadao/festivais/i-noites-de-ronda-2012',
    awards: [
      { slug: 'melhor-serenata' },
      { slug: 'melhor-estandarte' },
      { slug: 'tuna-mais-tuna' },
      { slug: 'segunda-melhor-tuna' },
    ],
  },
  // 2011
  {
    name: 'IX Terra de Cante',
    date: '2011-06-15',
    location: 'Beja',
    organizingTuna: 'TUB',
    awards: [
      { slug: 'melhor-pandeireta' },
      { slug: 'tuna-mais-tuna' },
      { slug: 'segunda-melhor-tuna' },
    ],
  },
  {
    name: 'XIV FITAFF',
    date: '2011-05-27',
    location: 'Figueira da Foz',
    organizingTuna: 'Imperial Neptuna',
    posterPublicId: 'tunadao/festivais/xiv-fitaff-2011',
    awards: [{ slug: 'melhor-tuna' }, { slug: 'melhor-serenata' }, { slug: 'melhor-pandeireta' }],
    tunas: ['TAISEP', 'TUM', 'TunaMagisterioCaceres'],
    guests: [],
  },
  {
    name: 'XIII Fartuna',
    date: '2011-04-01',
    location: 'Faro',
    organizingTuna: 'Versus Tuna',
    posterPublicId: 'tunadao/festivais/xiii-fartuna-2011',
    awards: [
      { slug: 'melhor-serenata' },
      { slug: 'melhor-pandeireta' },
      { slug: 'melhor-passacalles' },
      { slug: 'tuna-mais-marafada' },
      { slug: 'tuna-mais-tuna' },
    ],
    tunas: ['Tuna-MUs', 'TAFUL', 'Scalabituna'],
    guests: [],
  },
  {
    name: 'IX Estudantino',
    date: '2011-03-11',
    location: 'Lisboa',
    organizingTuna: 'Estudantina ISEL',
    posterPublicId: 'tunadao/festivais/ix-estudantino-2011',
    awards: [
      { slug: 'terceira-melhor-tuna' },
      { slug: 'tuna-mais-tuna' },
      { slug: 'tuna-do-publico' },
      { slug: 'melhor-serenata' },
      { slug: 'melhor-passacalles' },
      { slug: 'tuna-mais-real' },
      { slug: 'tuna-mais-bebedora' },
    ],
    tunas: ['TunaMedicinaMurcia', 'TunaCamoniana', 'EACB', 'Tintuna', 'TASCA'],
    guests: ['TunaFemininaISEL'],
  },
  // 2010
  {
    name: 'XI El Acor',
    date: '2010-03-12',
    location: 'Acores',
    organizingTuna: 'Tunideos',
    posterPublicId: 'tunadao/festivais/xi-el-acor-2010',
    awards: [
      { slug: 'terceira-melhor-tuna' },
      { slug: 'tuna-mais-tuna' },
      { slug: 'melhor-pandeireta' },
      { slug: 'melhor-estandarte' },
    ],
    tunas: ['TunaTS', 'TMP', 'EUC', 'Estudantina ISEL'],
    guests: ['TunaComElas', 'EnfInTuna', 'TUSA', 'BoraLaTocar'],
  },
  {
    name: 'IX Templario',
    date: '2010-03-20',
    location: 'Tomar',
    organizingTuna: 'Tuna Templaria',
    posterPublicId: 'tunadao/festivais/ix-templario-2010',
    awards: [
      { slug: 'segunda-melhor-tuna' },
      { slug: 'tuna-mais-tuna' },
      { slug: 'melhor-pandeireta' },
      { slug: 'tuna-do-publico' },
      { slug: 'melhor-passacalles' },
    ],
  },
  {
    name: 'XIII FITAFF',
    date: '2010-05-26',
    location: 'Figueira da Foz',
    organizingTuna: 'Imperial Neptuna',
    posterPublicId: 'tunadao/festivais/xiii-fitaff-2010',
    awards: [
      { slug: 'melhor-tuna' },
      { slug: 'tuna-mais-tuna', customNote: 'Premio Luis Daniel Nabais' },
    ],
  },
  // 2009
  {
    name: 'Oppidana 09',
    date: '2009-06-15',
    location: 'Guarda',
    organizingTuna: "Copituna d'Oppidana",
    awards: [{ slug: 'tuna-mais-tuna' }, { slug: 'melhor-tuna' }],
  },
  {
    name: 'XIII FETUF',
    date: '2009-06-15',
    location: 'Porto',
    organizingTuna: 'TFISCAP',
    awards: [
      { slug: 'melhor-passacalles' },
      { slug: 'melhor-tuna', customNote: 'Grande Premio XIII FETUF' },
      { slug: 'melhor-estandarte' },
    ],
  },
  {
    name: 'XVI FITISEP',
    date: '2009-06-15',
    location: 'Porto',
    organizingTuna: 'TAISEP',
    awards: [{ slug: 'melhor-tuna' }, { slug: 'melhor-pandeireta' }],
  },
  {
    name: 'XV FITUP-IDH',
    date: '2009-02-27',
    location: 'Porto',
    organizingTuna: 'TAUP',
    posterPublicId: 'tunadao/festivais/xv-fitup-idh-2009',
    awards: [{ slug: 'melhor-tuna' }, { slug: 'melhor-pandeireta' }, { slug: 'tuna-mais-tuna' }],
  },
  {
    name: 'FITAs 2009',
    date: '2009-06-15',
    location: 'Castelo Branco',
    organizingTuna: 'Castra Leuca',
    awards: [{ slug: 'melhor-tuna' }],
  },
  {
    name: 'XI Festilha',
    date: '2009-06-15',
    location: 'Ilhavo',
    organizingTuna: 'TUA',
    awards: [
      { slug: 'melhor-tuna' },
      { slug: 'tuna-mais-tuna' },
      { slug: 'melhor-instrumental' },
      { slug: 'melhor-pandeireta' },
      { slug: 'melhor-passacalles' },
    ],
  },
  {
    name: 'VI Cidade Berco',
    date: '2009-11-20',
    location: 'Guimaraes',
    organizingTuna: 'Afonsina',
    posterPublicId: 'tunadao/festivais/vi-cidade-berco-2009',
    awards: [
      { slug: 'segunda-melhor-tuna' },
      { slug: 'tuna-mais-tuna' },
      { slug: 'melhor-pandeireta' },
    ],
    tunas: ['TEUP', "Copituna d'Oppidana", 'TAFUL'],
    guests: ['TunObebes'],
  },
  {
    name: 'XVI Celta',
    date: '2009-12-11',
    location: 'Braga',
    organizingTuna: 'Azeituna',
    posterPublicId: 'tunadao/festivais/xvi-celta-2009',
    awards: [
      { slug: 'tuna-mais-tuna' },
      { slug: 'premio-tema-especial', customNote: 'Premio Tema Cabaret' },
    ],
  },
  // 2008
  {
    name: 'X FITAB 2008',
    date: '2008-06-15',
    location: 'Braganca',
    organizingTuna: 'RTUB',
    awards: [
      { slug: 'melhor-tuna' },
      { slug: 'tuna-mais-tuna' },
      { slug: 'melhor-pandeireta' },
      { slug: 'melhor-estandarte' },
    ],
  },
  {
    name: 'V FITUIFF',
    date: '2008-06-15',
    location: 'Figueira da Foz',
    organizingTuna: 'Bruna',
    awards: [{ slug: 'melhor-tuna' }, { slug: 'melhor-instrumental' }, { slug: 'melhor-serenata' }],
  },
  {
    name: 'XII FETUF',
    date: '2008-06-15',
    location: 'Porto',
    organizingTuna: 'TFISCAP',
    awards: [
      { slug: 'melhor-estandarte' },
      { slug: 'melhor-pandeireta' },
      { slug: 'melhor-passacalles' },
      { slug: 'melhor-instrumental' },
      { slug: 'tuna-mais-tuna' },
      { slug: 'melhor-tuna', customNote: 'Grande Premio XII FETUF' },
    ],
  },
  {
    name: "III Ulveira d'Espital",
    date: '2008-06-15',
    location: 'Oliveira do Hospital',
    organizingTuna: null,
    awards: [
      { slug: 'melhor-tuna' },
      { slug: 'melhor-pandeireta' },
      { slug: 'melhor-passacalles' },
      { slug: 'melhor-estandarte' },
    ],
  },
  {
    name: 'II Festival Tunas da Raia',
    date: '2008-06-15',
    location: 'Sabugal',
    organizingTuna: null,
    awards: [{ slug: 'melhor-passacalles' }, { slug: 'melhor-pandeireta' }],
  },
  {
    name: 'II FITUCB',
    date: '2008-06-15',
    location: 'Castelo Branco',
    organizingTuna: 'EACB',
    posterPublicId: 'tunadao/festivais/ii-fitucb-2008',
    awards: [{ slug: 'tuna-mais-tuna' }, { slug: 'melhor-tuna' }, { slug: 'melhor-instrumental' }],
    tunas: ["Copituna d'Oppidana", 'Tuna Templaria', 'Arrebitatuna'],
    guests: [],
  },
  {
    name: 'VIII Festival Internacional de Tunas do Atlantico',
    date: '2008-06-15',
    location: 'Madeira',
    organizingTuna: 'TUM-Madeira',
    awards: [
      { slug: 'melhor-pandeireta' },
      { slug: 'melhor-tuna' },
      { slug: 'tuna-mais-tuna' },
      { slug: 'melhor-instrumental' },
    ],
  },
  // 2007
  {
    name: 'IV Fardas',
    date: '2007-06-15',
    location: 'Porto',
    organizingTuna: 'TAEP',
    awards: [{ slug: 'premio-participacao' }],
  },
  {
    name: 'II Festival de Tunas Academicas de Santa Comba Dao',
    date: '2007-06-15',
    location: 'Santa Comba Dao',
    organizingTuna: null,
    awards: [{ slug: 'melhor-estandarte' }],
  },
  {
    name: 'I Encontro de Tunas da ESEnfC',
    date: '2007-06-15',
    location: 'Coimbra',
    organizingTuna: null,
    awards: [{ slug: 'melhor-tuna' }, { slug: 'tuna-mais-tuna' }],
  },
  {
    name: 'I Por Terras do Sado',
    date: '2007-06-15',
    location: 'Setubal',
    organizingTuna: 'TASCA',
    awards: [
      { slug: 'melhor-instrumental' },
      { slug: 'melhor-serenata' },
      { slug: 'melhor-pandeireta' },
      { slug: 'tuna-mais-tuna' },
    ],
  },
  {
    name: 'II FETUA - ESEnf',
    date: '2007-06-15',
    location: 'Oliveira de Azemeis',
    organizingTuna: null,
    awards: [{ slug: 'melhor-tuna' }],
  },
  // 2006
  {
    name: 'VI FITAL Pax Julia',
    date: '2006-06-15',
    location: 'Beja',
    organizingTuna: 'Semper Tesus',
    awards: [{ slug: 'premio-participacao' }],
  },
  {
    name: 'IV Festubi',
    date: '2006-06-15',
    location: 'Covilha',
    organizingTuna: 'Desertuna',
    awards: [{ slug: 'premio-participacao' }],
  },
  {
    name: 'III Ciclone',
    date: '2006-06-15',
    location: 'Acores',
    organizingTuna: 'TUSA',
    awards: [{ slug: 'tuna-mais-tuna', customNote: 'Premio Mestre Tuso' }],
  },
  // 2005
  {
    name: 'Festival de Tunas do 15o Aniversario do ISVOUGA',
    date: '2005-06-15',
    location: 'Santa Maria da Feira',
    organizingTuna: null,
    awards: [{ slug: 'melhor-pandeireta' }],
  },
  {
    name: 'Maltunas - Festival de Tunas Academicas',
    date: '2005-06-15',
    location: 'Guarda',
    organizingTuna: null,
    awards: [{ slug: 'melhor-solista' }],
  },
  {
    name: 'FITQFC 2005 - Festival Internacional de Tunas da Queima das Fitas de Coimbra',
    date: '2005-06-15',
    location: 'Coimbra',
    organizingTuna: 'QFC',
    awards: [{ slug: 'melhor-tuna' }, { slug: 'tuna-mais-tuna' }],
  },
  {
    name: 'VII FITAB 2005',
    date: '2005-06-15',
    location: 'Braganca',
    organizingTuna: 'RTUB',
    awards: [{ slug: 'melhor-tuna' }, { slug: 'melhor-serenata' }],
  },
  {
    name: 'III Festubi',
    date: '2005-03-12',
    location: 'Covilha',
    organizingTuna: 'Desertuna',
    posterPublicId: 'tunadao/festivais/iii-festubi-2005',
    awards: [{ slug: 'melhor-instrumental' }],
    tunas: ['TASCA', 'TMUC', 'Magna Tuna Cartola', 'ESTunaCB'],
    guests: ['Desertuna'],
  },
  {
    name: 'VI Vultos',
    date: '2005-06-15',
    location: 'Vila Nova de Gaia',
    organizingTuna: null,
    awards: [{ slug: 'tuna-mais-tuna' }],
  },
  // 2004
  {
    name: 'Festival de Tunas do Vale do Arda',
    date: '2004-06-15',
    location: 'Castelo de Paiva',
    organizingTuna: null,
    awards: [{ slug: 'melhor-instrumental' }, { slug: 'melhor-solista' }],
  },
  {
    name: 'I FITACA',
    date: '2004-06-15',
    location: 'Mirandela',
    organizingTuna: null,
    awards: [{ slug: 'melhor-tuna' }, { slug: 'melhor-instrumental' }, { slug: 'tuna-mais-tuna' }],
  },
  {
    name: 'I Collipo',
    date: '2004-03-12',
    location: 'Leiria',
    organizingTuna: 'Trovantina',
    awards: [{ slug: 'premio-participacao' }],
  },
  // 2002
  {
    name: 'I Festival de Tunas Politecnicas da AEESTV',
    date: '2002-06-15',
    location: 'Viseu',
    organizingTuna: null,
    awards: [{ slug: 'premio-participacao' }],
  },
  // 2001
  {
    name: 'I CENTUP',
    date: '2001-06-15',
    location: 'Santarem',
    organizingTuna: 'Scalabituna',
    awards: [{ slug: 'tuna-mais-tuna' }],
  },
  // 1999
  {
    name: '1o Festival de Tunas Academicas de Fornos',
    date: '1999-06-15',
    location: 'Freixo de Espada a Cinta',
    organizingTuna: null,
    awards: [{ slug: 'terceira-melhor-tuna' }, { slug: 'melhor-pandeireta' }],
  },
];
