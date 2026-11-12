export interface BlogPost {
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  date: string;
  image: string;
  category: string;
  readingTime: number;
}

export const postsData: Record<string, BlogPost> = {
  'citadao-2025': {
    slug: 'citadao-2025',
    title: 'CITADÃO 2025 - 19ª Edição',
    excerpt:
      'A 19ª edição do CITADÃO está a chegar! Descobre todas as novidades do maior certame de tunas académicas da região do Dão.',
    content: `
      <p>É com enorme satisfação que anunciamos a <strong>19ª edição do CITADÃO</strong> - Certame Internacional de Tunas Académicas do Dão!</p>

      <p>Este ano, o festival regressa em Maio de 2025, prometendo mais uma edição memorável com as melhores tunas do país e convidados especiais.</p>

      <h2>O que esperar?</h2>
      <p>Como é tradição, o CITADÃO contará com:</p>
      <ul>
        <li>Concurso de tunas académicas</li>
        <li>Atuações de tunas convidadas</li>
        <li>Passacalles pelas ruas de Viseu</li>
        <li>Serenatas e muito convívio</li>
      </ul>

      <p>Mais informações sobre o local, datas exatas e tunas participantes serão anunciadas em breve. Fica atento às nossas redes sociais!</p>
    `,
    date: '2025-01-15',
    image: '/images/blog/citadao-2025.jpg',
    category: 'Eventos',
    readingTime: 3,
  },
  'aniversario-tunadao': {
    slug: 'aniversario-tunadao',
    title: 'Tunadão celebra mais um aniversário',
    excerpt:
      'Mais um ano de história para a tuna mais antiga da Universidade Politécnica de Viseu. Celebramos com música e convívio.',
    content: `
      <p>A <strong>Tunadão 1998</strong> celebra mais um aniversário, reafirmando o seu compromisso com a tradição tunante e a vida académica de Viseu.</p>

      <p>Desde a sua fundação em 3 de Maio de 1998, a Tunadão tem sido um pilar da cultura académica da Universidade Politécnica de Viseu, levando o nome da instituição por todo o país e além-fronteiras.</p>

      <h2>Uma história de sucesso</h2>
      <p>Ao longo destes anos, conquistámos centenas de prémios em festivais de tunas, organizámos 18 edições do CITADÃO, e formámos dezenas de tunos que levam connosco memórias inesquecíveis.</p>

      <p>Obrigado a todos os que fazem parte desta família tunante!</p>
    `,
    date: '2024-11-16',
    image: '/images/blog/aniversario.jpg',
    category: 'Notícias',
    readingTime: 2,
  },
  'premio-fitua-2024': {
    slug: 'premio-fitua-2024',
    title: 'Tunadão conquista prémios no FITUA',
    excerpt:
      'A Tunadão participou no Festival Internacional de Tunas da Universidade de Aveiro e trouxe prémios para casa.',
    content: `
      <p>A Tunadão 1998 marcou presença no <strong>FITUA - Festival Internacional de Tunas da Universidade de Aveiro</strong>, um dos festivais mais prestigiados do calendário tunante nacional.</p>

      <h2>Prémios conquistados</h2>
      <p>A nossa participação foi coroada de sucesso, tendo conquistado:</p>
      <ul>
        <li>Prémio de Melhor Instrumental</li>
        <li>Prémio de Melhor Tuna</li>
        <li>Prémio Tuna + Bebedoura</li>
      </ul>

      <p>Estes prémios são o resultado do trabalho árduo de todos os membros da tuna, dos ensaios intensivos e da paixão que colocamos em cada atuação.</p>

      <p>Parabéns a todos os tunos que participaram! Que venham muitos mais!</p>
    `,
    date: '2024-05-20',
    image: '/images/blog/fitua.jpg',
    category: 'Prémios',
    readingTime: 4,
  },
  'novos-tunos-2024': {
    slug: 'novos-tunos-2024',
    title: 'Bem-vindos novos tunos!',
    excerpt:
      'A Tunadão dá as boas-vindas aos novos membros que se juntaram à nossa família tunante este ano letivo.',
    content: `
      <p>É com grande alegria que damos as boas-vindas aos novos caloiros que se juntaram à <strong>Tunadão 1998</strong> neste ano letivo!</p>

      <p>A chegada de novos membros é sempre um momento especial na vida da tuna. São eles que trazem nova energia, novas ideias e garantem a continuidade da nossa tradição.</p>

      <h2>O caminho de um tuno</h2>
      <p>O percurso de integração na Tunadão passa por várias fases:</p>
      <ul>
        <li><strong>Aprendiz:</strong> Fase inicial de aprendizagem musical</li>
        <li><strong>Caloiro:</strong> Período de integração na tuna</li>
        <li><strong>Tuno:</strong> Membro pleno da tuna</li>
      </ul>

      <p>Aos novos membros, desejamos um excelente percurso na Tunadão e muitas aventuras pela frente!</p>
    `,
    date: '2024-10-01',
    image: '/images/blog/novos-tunos.jpg',
    category: 'Notícias',
    readingTime: 2,
  },
};

// Helper to get all posts as array
export function getAllPosts(): BlogPost[] {
  return Object.values(postsData).sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );
}
