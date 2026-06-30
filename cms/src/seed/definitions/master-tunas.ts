/**
 * Master list of all tunas with shortName as unique identifier.
 * This is the single source of truth for tuna data in the seed system.
 */

export interface MasterTuna {
  shortName: string;
  fullName: string;
  city?: string;
  website?: string;
  /** Cloudinary public ID for logo (without extension) */
  logoPublicId?: string;
  type?:
    | 'tuna'
    | 'tuna-feminina'
    | 'tuna-veterana'
    | 'tuna-senior'
    | 'international'
    | 'group'
    | 'soloist';
}

/**
 * All known tunas from Citadao editions and Palmares history.
 * shortName is the unique identifier used for lookups.
 */
export const MASTER_TUNAS: MasterTuna[] = [
  // === A ===
  {
    shortName: 'Adfectus',
    fullName: 'Adfectus (Ricardo Rocha - One Man Band)',
    city: 'Viseu',
    logoPublicId: 'tunadao/tunas/adfectus',
    type: 'soloist',
  },
  {
    shortName: 'Afonsina',
    fullName: 'Tuna de Engenharia da Universidade do Minho',
    city: 'Guimaraes',
    website: 'https://afonsina.com/',
    logoPublicId: 'tunadao/tunas/afonsina',
  },
  {
    shortName: 'Afrodituna',
    fullName: 'Tuna Academica Feminina do Campus 2 do Politecnico do Porto',
    city: 'Porto',
    type: 'tuna-feminina',
  },
  {
    shortName: 'AlcaTuna',
    fullName: 'AlcaTuna de Alcafache',
    city: 'Alcafache',
    logoPublicId: 'tunadao/tunas/alcatuna-alcafache',
  },
  {
    shortName: 'AMeiaNoite',
    fullName: 'A Meia Noite Nas Eolicas',
    type: 'group',
  },
  {
    shortName: 'anTUNiA',
    fullName: 'Tuna de Ciencias e Tecnologia da Universidade Nova de Lisboa',
    city: 'Lisboa',
    website: 'https://antunia.fct.unl.pt/',
    logoPublicId: 'tunadao/tunas/antunia',
  },
  {
    shortName: 'Arrebitatuna',
    fullName: 'Tuna Feminina da Associacao de Estudantes da ESECB',
    city: 'Castelo Branco',
    type: 'tuna-feminina',
  },
  {
    shortName: 'ArtintunaCopitusa',
    fullName: 'Tuna Masculina da Escola Superior de Artes Aplicadas de Castelo Branco',
    city: 'Castelo Branco',
  },
  {
    shortName: 'AteneuLeiria',
    fullName: 'Ateneu de Leiria',
    city: 'Leiria',
    type: 'group',
  },
  {
    shortName: 'Azeituna',
    fullName: 'Tuna da Universidade do Minho',
    city: 'Braga',
    website: 'https://azeituna.pt/',
    logoPublicId: 'tunadao/tunas/azeituna',
  },

  // === B ===
  {
    shortName: 'Bagatuna',
    fullName: 'Bagatuna',
  },
  {
    shortName: 'BoraLaTocar',
    fullName: 'Bora La Tocar',
    city: 'Ponta Delgada',
    type: 'group',
  },
  {
    shortName: 'Bruna',
    fullName: 'Tuna Universitaria da Figueira da Foz',
    city: 'Figueira da Foz',
  },
  {
    shortName: 'ButchersBrassBand',
    fullName: 'Butchers Brass Band',
    city: 'Aveiro',
    type: 'group',
  },

  // === C ===
  {
    shortName: 'Castra Leuca',
    fullName: 'Tuna Academica Masculina do Instituto Politecnico de Castelo Branco',
    city: 'Castelo Branco',
    logoPublicId: 'tunadao/tunas/castra-leuca',
  },
  {
    shortName: 'Charrascos da Citania',
    fullName: 'Charrascos da Citania',
    city: 'Viseu',
    type: 'group',
  },
  {
    shortName: "Copituna d'Oppidana",
    fullName: 'Tuna Academica da Guarda',
    city: 'Guarda',
    website: 'https://tagcopituna.wixsite.com/copituna-d-oppidana',
    logoPublicId: 'tunadao/tunas/copituna',
  },
  {
    shortName: 'Cordas ao Cubo',
    fullName: 'Cordas ao Cubo',
    type: 'group',
  },

  // === D ===
  {
    shortName: 'DArtatuna',
    fullName: 'Tuna Academica Feminina da Escola Superior de Artes Aplicadas de Castelo Branco',
    city: 'Castelo Branco',
    type: 'tuna-feminina',
  },
  {
    shortName: 'Desertuna',
    fullName: 'Tuna Academica da Universidade da Beira Interior',
    city: 'Covilha',
    website: 'https://www.portugaltunas.com/directorio/desertuna/',
    logoPublicId: 'tunadao/tunas/desertuna',
  },

  // === E ===
  {
    shortName: 'EACB',
    fullName: 'Estudantina Academica de Castelo Branco',
    city: 'Castelo Branco',
    logoPublicId: 'tunadao/tunas/estudantina-academica-castelo-branco',
  },
  {
    shortName: 'EduardoRebelo',
    fullName: 'Eduardo Rebelo',
    type: 'soloist',
  },
  {
    shortName: 'EnfInTuna',
    fullName: 'Tuna Mista da Escola Superior de Enfermagem de Ponta Delgada',
    city: 'Ponta Delgada',
  },
  {
    shortName: 'Estudantina ISEL',
    fullName: 'Estudantina Academica do ISEL',
    city: 'Lisboa',
    logoPublicId: 'tunadao/tunas/estudantina-academica-isel',
  },
  {
    shortName: 'Estudantina Lamego',
    fullName: 'Estudantina Academica de Lamego',
    city: 'Lamego',
    logoPublicId: 'tunadao/tunas/estudantina-academica-lamego',
  },
  {
    shortName: 'ESTunaCB',
    fullName:
      'Tuna Academica Masculina da Escola Superior de Tecnologia do Instituto Politecnico de Castelo Branco',
    city: 'Castelo Branco',
  },
  {
    shortName: 'EUC',
    fullName: 'Estudantina Universitaria de Coimbra',
    city: 'Coimbra',
    logoPublicId: 'tunadao/tunas/estudantina-universitaria-coimbra',
  },
  {
    shortName: 'EUL',
    fullName: 'Estudantina Universitaria de Lisboa',
    city: 'Lisboa',
    website: 'https://www.portugaltunas.com/directorio/estudantinalisboa/',
    logoPublicId: 'tunadao/tunas/estudantina-universitaria-lisboa',
  },

  // === F ===
  {
    shortName: 'Fado Livre',
    fullName: 'Grupo de Fados',
    city: 'Viseu',
    type: 'group',
  },
  {
    shortName: 'FAN-Farra',
    fullName: 'Farra Academica de Coimbra',
    city: 'Coimbra',
    website: 'http://www.portugaltunas.com/directorio/fanfarracoimbra/',
    logoPublicId: 'tunadao/tunas/fan-farra-academica-coimbra',
  },
  // === G ===
  {
    shortName: 'GATUNA',
    fullName: 'Tuna Feminina da Universidade do Minho',
    city: 'Braga',
    type: 'tuna-feminina',
  },
  {
    shortName: 'Gatunos',
    fullName: 'Tuna Academica do Politecnico do Porto',
    city: 'Vila do Conde',
    website: 'https://alcatraz.gatunos.pt/',
  },
  {
    shortName: 'GrupoFadosEACB',
    fullName: 'Grupo de Fados da EACB',
    city: 'Castelo Branco',
    type: 'group',
  },

  // === H ===
  {
    shortName: 'Hinoportuna',
    fullName: 'Tuna Academica do Instituto Politecnico de Viana do Castelo',
    city: 'Viana do Castelo',
    logoPublicId: 'tunadao/tunas/hinoportuna',
  },

  // === I ===
  {
    shortName: 'Imperial Neptuna',
    fullName: 'Tuna Academica da Figueira da Foz',
    city: 'Figueira da Foz',
    logoPublicId: 'tunadao/tunas/imperial-neptuna',
  },
  {
    shortName: 'Infantuna',
    fullName: 'Infantuna Cidade de Viseu',
    city: 'Viseu',
    website: 'https://www.portugaltunas.com/directorio/infantuna/',
    logoPublicId: 'tunadao/tunas/infantuna-cidade-viseu',
    type: 'group',
  },

  // === J ===
  {
    shortName: 'Jogralhos',
    fullName: 'Jogralhos',
    city: 'Braga',
    type: 'group',
  },

  // === L ===
  {
    shortName: 'Luz&Tuna',
    fullName: 'Tuna da Universidade Lusiada de Lisboa',
    city: 'Lisboa',
    website: 'https://www.luztuna.pt/',
    logoPublicId: 'tunadao/tunas/luztuna',
  },
  // === M ===
  {
    shortName: 'Magna Tuna Cartola',
    fullName: 'Tuna da Universidade de Aveiro',
    city: 'Aveiro',
    logoPublicId: 'tunadao/tunas/magna-tuna-cartola',
  },

  // === O ===
  {
    shortName: 'Oportuna',
    fullName: 'Tuna Academica de Ciencias da Saude do Norte',
    city: 'Porto',
  },
  {
    shortName: 'Orfeao IPV',
    fullName: 'Orfeao Academico do I.P.V.',
    city: 'Viseu',
    type: 'group',
  },
  {
    shortName: 'Orfeao Viseu',
    fullName: 'Orfeao Academico de Viseu',
    city: 'Viseu',
    type: 'group',
  },
  {
    shortName: 'OUP',
    fullName: 'Orfeao Universitario do Porto',
    city: 'Porto',
    website: 'https://orfeao.up.pt/',
    type: 'group',
  },

  // === Q ===
  {
    shortName: 'QFC',
    fullName: 'Queima das Fitas de Coimbra',
    city: 'Coimbra',
    logoPublicId: 'tunadao/tunas/queima-fitas-coimbra',
  },

  // === R ===
  {
    shortName: 'Real Tunel',
    fullName: 'Real Tunel Academico',
    city: 'Viseu',
    logoPublicId: 'tunadao/tunas/real-tunel-academico',
  },
  {
    shortName: 'RTUB',
    fullName: 'Real Tuna Universitaria de Braganca',
    city: 'Braganca',
    logoPublicId: 'tunadao/tunas/real-tuna-braganca',
  },

  // === S ===
  {
    shortName: 'Scalabituna',
    fullName: 'Tuna do Instituto Politecnico de Santarem',
    city: 'Santarem',
    logoPublicId: 'tunadao/tunas/scalabituna',
  },
  {
    shortName: 'Semper Tesus',
    fullName: 'Tuna Academica da Escola Superior Agraria de Beja',
    city: 'Beja',
    logoPublicId: 'tunadao/tunas/semper-tesus',
  },
  {
    shortName: 'SINA',
    fullName: 'SINA',
  },
  {
    shortName: 'SonsDeBeiroa',
    fullName: 'Sons de Beiroa',
    city: 'Castelo Branco',
    type: 'group',
  },

  // === T ===
  {
    shortName: 'TAB',
    fullName: 'Tuna Academica de Biomedicas do Porto',
    city: 'Porto',
  },
  {
    shortName: 'TAEP',
    fullName: 'Tuna Academica de Enfermagem do Porto',
    city: 'Porto',
  },
  {
    shortName: 'TAFDUP',
    fullName: 'Tuna Academica da Faculdade de Direito da Universidade do Porto',
    city: 'Porto',
    website: 'https://x.com/tafdup',
  },
  {
    shortName: 'TAFUL',
    fullName: 'Tuna Academica de Farmacia da Universidade de Lisboa',
    city: 'Lisboa',
  },
  {
    shortName: 'TAIPCA',
    fullName: 'Tuna Academica do Instituto Politecnico do Cavado e do Ave',
    city: 'Barcelos',
  },
  {
    shortName: 'TAISEP',
    fullName: 'Tuna Academica do Instituto Superior de Engenharia do Porto',
    city: 'Porto',
    website: 'https://en.taisep.com/',
  },
  {
    shortName: 'TAL',
    fullName: 'Tuna Academica de Lisboa',
    city: 'Lisboa',
  },
  {
    shortName: 'TASCA',
    fullName: 'Tuna Academica de Setubal Cidade Amada',
    city: 'Setubal',
  },
  {
    shortName: 'TAUE',
    fullName: 'Tuna Academica da Universidade de Evora',
    city: 'Evora',
    website: 'https://www.taue.uevora.pt/',
    logoPublicId: 'tunadao/tunas/tuna-academica-evora',
  },
  {
    shortName: 'TAUFP',
    fullName: 'Tuna da Universidade Fernando Pessoa',
    city: 'Porto',
    logoPublicId: 'tunadao/tunas/tuna-fernando-pessoa',
  },
  {
    shortName: 'TAUP',
    fullName: 'Tuna Academica da Universidade Portucalense',
    city: 'Porto',
    logoPublicId: 'tunadao/tunas/tuna-portucalense',
  },
  {
    shortName: 'TCML',
    fullName: 'Tuna del Colegio Mayor Loyola - Granada',
    city: 'Granada',
    type: 'international',
  },
  {
    shortName: 'TDUP',
    fullName: 'Tuna do Distrito Universitario do Porto',
    city: 'Porto',
    website: 'https://www.instagram.com/tduporto/',
    logoPublicId: 'tunadao/tunas/tdup',
  },
  {
    shortName: 'TEUP',
    fullName: 'Tuna de Engenharia da Universidade do Porto',
    city: 'Porto',
    website: 'https://fe.up.pt/teup/',
    logoPublicId: 'tunadao/tunas/teup',
  },
  {
    shortName: 'TFA',
    fullName: 'Tuna Feminina Albicastrense',
    city: 'Castelo Branco',
    type: 'tuna-feminina',
  },
  {
    shortName: 'TFAAUAV',
    fullName: 'Tuna Feminina da Associacao Academica da Universidade de Aveiro',
    city: 'Aveiro',
    type: 'tuna-feminina',
  },
  {
    shortName: 'TFIPCA',
    fullName: 'Tuna Feminina do Instituto Politecnico do Cavado e do Ave',
    city: 'Barcelos',
    type: 'tuna-feminina',
  },
  {
    shortName: 'TFISCAP',
    fullName: 'Tuna Feminina do ISCAP',
    city: 'Porto',
    type: 'tuna-feminina',
  },
  {
    shortName: 'Tintuna',
    fullName: 'Tuna Academica da Egas Moniz',
    city: 'Madeira',
  },
  {
    shortName: 'TMG',
    fullName: 'Tuna de Medicina de Granada',
    city: 'Granada',
    type: 'international',
  },
  {
    shortName: 'TMP',
    fullName: 'Tuna de Medicina do Porto',
    city: 'Porto',
    logoPublicId: 'tunadao/tunas/tuna-medicina-porto',
  },
  {
    shortName: 'TMUC',
    fullName: 'Tuna de Medicina da Universidade de Coimbra',
    city: 'Coimbra',
    website: 'https://www.instagram.com/tunamedicinacoimbra/',
    logoPublicId: 'tunadao/tunas/tuna-medicina-coimbra',
  },
  {
    shortName: 'Trovantina',
    fullName: 'Tuna Masculina do Instituto Politecnico de Leiria',
    city: 'Leiria',
  },
  {
    shortName: 'TUA',
    fullName: 'Tuna Universitaria de Aveiro',
    city: 'Aveiro',
    website: 'https://www.facebook.com/tunauniversitariadeaveiro/',
    logoPublicId: 'tunadao/tunas/tua-aveiro',
  },
  {
    shortName: 'TUB',
    fullName: 'Tuna Universitaria de Beja',
    city: 'Beja',
    logoPublicId: 'tunadao/tunas/tub-beja',
  },
  {
    shortName: 'TUCP',
    fullName: 'Tuna da Universidade Catolica Portuguesa do Porto',
    city: 'Porto',
  },
  {
    shortName: 'TUIST',
    fullName: 'Tuna Universitaria do Instituto Superior Tecnico',
    city: 'Lisboa',
    logoPublicId: 'tunadao/tunas/tuist',
  },
  {
    shortName: 'TUM',
    fullName: 'Tuna Universitaria do Minho',
    city: 'Braga',
    website: 'https://tum.pt/',
    logoPublicId: 'tunadao/tunas/tuna-universitaria-minho',
  },
  {
    shortName: 'TUM-Madeira',
    fullName: 'Tuna Universitaria da Madeira',
    city: 'Funchal',
    logoPublicId: 'tunadao/tunas/tuma-madeira',
  },
  {
    shortName: 'Tuna Salamanca',
    fullName: 'Tuna Universitaria de Salamanca',
    city: 'Salamanca',
    type: 'international',
  },
  {
    shortName: 'Tuna Templaria',
    fullName: 'Tuna Templaria do Instituto Politecnico de Tomar',
    city: 'Tomar',
    logoPublicId: 'tunadao/tunas/tuna-templaria-tomar',
  },
  {
    shortName: 'Tuna-MUs',
    fullName: 'Tuna Medica da Universidade da Beira Interior',
    city: 'Covilha',
  },
  {
    shortName: 'TunaAgricolasSevilla',
    fullName: 'Tuna de Agricolas de Sevilla',
    city: 'Sevilla',
    type: 'international',
  },
  {
    shortName: 'TunaCamoniana',
    fullName: 'Tuna Camoniana "In Vino Veritas" da Universidade Autonoma de Lisboa',
    city: 'Lisboa',
  },
  {
    shortName: 'TunaComElas',
    fullName: 'Tuna Feminina da Associacao Academica da Universidade dos Acores',
    city: 'Ponta Delgada',
    type: 'tuna-feminina',
  },
  {
    shortName: 'TunaContabilidadePorto',
    fullName: 'Tuna de Contabilidade do Porto',
    city: 'Porto',
  },
  {
    shortName: 'Tunadao1998',
    fullName: 'Tuna do Instituto Politecnico de Viseu',
    city: 'Viseu',
  },
  {
    shortName: 'TunaDerechoAlicante',
    fullName: 'Tuna de Derecho de Alicante',
    city: 'Alicante',
    type: 'international',
  },
  {
    shortName: 'TunaDerechoUNAM',
    fullName: 'Tuna de Derecho de la UNAM',
    city: 'Mexico DF',
    type: 'international',
  },
  {
    shortName: 'TunaDerechoValladolid',
    fullName: 'Tuna de Derecho de Valladolid',
    city: 'Valladolid',
    type: 'international',
  },
  {
    shortName: 'TunaEngBeja',
    fullName: 'Tuna de Engenharia da Universidade de Beja',
    city: 'Beja',
  },
  {
    shortName: 'TUNAFE',
    fullName: 'Tuna Feminina de Engenharia da Universidade do Porto',
    city: 'Porto',
    type: 'tuna-feminina',
  },
  {
    shortName: 'TunaFemininaISEL',
    fullName: 'Tuna Feminina do Instituto Superior de Engenharia de Lisboa',
    city: 'Lisboa',
    type: 'tuna-feminina',
  },
  {
    shortName: 'TunaFemininaISEP',
    fullName: 'Tuna Feminina do Instituto Superior de Engenharia do Porto',
    city: 'Porto',
    type: 'tuna-feminina',
  },
  {
    shortName: 'TunaLusiadaFamalicao',
    fullName: 'Tuna Academica da Universidade Lusiada de Vila Nova de Famalicao',
    city: 'Vila Nova de Famalicao',
  },
  {
    shortName: 'TunaMagisterioCaceres',
    fullName: 'Tuna de Magisterio de Caceres',
    city: 'Caceres',
    type: 'international',
  },
  {
    shortName: 'TunaMedicinaBadajoz',
    fullName: 'Tuna de Medicina de Badajoz',
    city: 'Badajoz',
    type: 'international',
  },
  {
    shortName: 'TunaMedicinaMurcia',
    fullName: 'Tuna de Medicina de Murcia',
    city: 'Murcia',
    type: 'international',
  },
  {
    shortName: 'TunaNavarra',
    fullName: 'Tuna Antigua de Navarra',
    city: 'Navarra',
    type: 'international',
  },
  {
    shortName: 'TunaoMinho',
    fullName: 'Tuna Academica Feminina da Universidade do Minho',
    city: 'Braga',
    type: 'tuna-feminina',
  },
  {
    shortName: 'TunaPonferrada',
    fullName: 'Tuna Universitaria de Ponferrada',
    city: 'Ponferrada',
    type: 'international',
  },
  {
    shortName: 'TunaTS',
    fullName: 'Tuna de Tecnologias da Saude do Porto',
    city: 'Porto',
  },
  {
    shortName: 'TunaVeteranaAveiro',
    fullName: 'Tuna Veterana Feminina de Aveiro',
    city: 'Aveiro',
    type: 'tuna-veterana',
  },
  {
    shortName: 'TunaVeteranosViana',
    fullName: 'Tuna de Veteranos de Viana do Castelo',
    city: 'Viana do Castelo',
    type: 'tuna-veterana',
  },
  {
    shortName: 'TUNICE',
    fullName: 'Tuna Academica Feminina do Instituto Politecnico de Viana do Castelo',
    city: 'Viana do Castelo',
    type: 'tuna-feminina',
  },
  {
    shortName: 'Tunideos',
    fullName: 'Tuna Masculina da Universidade dos Acores',
    city: 'Ponta Delgada',
    website: 'https://www.tunideos.com/',
    logoPublicId: 'tunadao/tunas/tunideos',
  },
  {
    shortName: 'TunObebes',
    fullName: 'Tuna Feminina de Engenharia da Universidade do Minho',
    city: 'Guimaraes',
    type: 'tuna-feminina',
  },
  {
    shortName: 'TUP',
    fullName: 'Tuna Universitaria do Porto',
    city: 'Porto',
    website: 'https://orfeao.up.pt/portfolio-item/tup/',
    logoPublicId: 'tunadao/tunas/tuna-universitaria-porto',
  },
  {
    shortName: 'TUPLA',
    fullName: 'Tuna de la Universidade Peruana Los Andes',
    city: 'Peru',
    type: 'international',
  },
  {
    shortName: 'TUSA',
    fullName: 'T.U.S.A. - Tuna Universitas Scientiarum Agrariarum',
    city: 'Angra do Heroismo',
    logoPublicId: 'tunadao/tunas/tusa',
  },
  {
    shortName: 'TUSALBI',
    fullName: 'Tuna da Universidade Senior Albicastrense',
    city: 'Castelo Branco',
    type: 'tuna-senior',
  },
  {
    shortName: 'TUSALD',
    fullName: 'Real Tuna Academica da ESS Dr. Lopes Dias do IPCB',
    city: 'Castelo Branco',
  },
  {
    shortName: 'Tusofona',
    fullName: 'Real Tuna Lusofona',
    city: 'Lisboa',
  },

  // === V ===
  {
    shortName: 'Versus Tuna',
    fullName: 'Tuna Academica da Universidade do Algarve',
    city: 'Faro',
    logoPublicId: 'tunadao/tunas/versus-tuna',
  },
  {
    shortName: 'Viriatuna',
    fullName: 'Tuna Academica da Escola Superior de Saude de Viseu',
    city: 'Viseu',
    website: 'https://viriatuna.wixsite.com/viriatuna/',
    logoPublicId: 'tunadao/tunas/viriatuna-essv',
  },
];

/**
 * Lookup map for fast access by shortName
 */
export const TUNA_BY_SHORT_NAME = new Map<string, MasterTuna>(
  MASTER_TUNAS.map((tuna) => [tuna.shortName, tuna])
);

/**
 * Get a tuna by shortName
 * @throws Error if tuna not found
 */
export function getMasterTuna(shortName: string): MasterTuna {
  const tuna = TUNA_BY_SHORT_NAME.get(shortName);
  if (!tuna) {
    throw new Error(`Unknown tuna shortName: "${shortName}". Add it to MASTER_TUNAS first.`);
  }
  return tuna;
}
