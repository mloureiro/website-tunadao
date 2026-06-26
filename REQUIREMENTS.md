# Tunadão Website - Requirements Document

## 1. Visão Geral

**Propósito:** Site institucional para a Tunadão - Tuna do Instituto Politécnico de Viseu, apresentando:

- Festival CITADÃO
- Palmarés (prémios ganhos)
- Blog/Notícias
- Galeria
- Informação institucional

**Público-alvo:** Comunidade académica

**Sites de referência:**

- <https://tum.pt/>
- <https://ae.fct.unl.pt/antunia/>
- <https://tuist.pt/home>

**Templates de design apreciados:**

- <https://html5up.net/twenty>
- <https://html5up.net/helios>
- <https://html5up.net/solid-state>

---

## 2. Stack Tecnológico

| Componente       | Tecnologia           |
| ---------------- | -------------------- |
| Frontend         | Astro (SSG)          |
| CMS              | PayloadCMS           |
| Base de Dados    | Turso (SQLite)       |
| Hosting Frontend | GitHub Pages         |
| Hosting CMS      | A definir (gratuito) |
| CI/CD            | GitHub Actions       |
| Testes           | Vitest + Playwright  |
| Linting          | ESLint + Prettier    |
| Linguagem        | TypeScript           |

---

## 3. Estrutura de Páginas

### 3.1 Home

- Hero section com imagem/vídeo
- Destaques do próximo CITADÃO
- Últimas notícias
- Prémios recentes
- Call-to-actions

### 3.2 Sobre Nós

- História da Tunadão (desde 1998)
- Como começou
- "Tesourinhos" (momentos especiais)
- Membros/fotos de grupo

### 3.3 Citadão (Festival)

- Informação sobre o festival
- Lista de todas as edições (2004-presente)
- Para cada edição:
  - Ano e número da edição
  - Data
  - Local
  - Poster
  - Tunas participantes
  - Tunas convidadas
  - Prémios atribuídos
  - Notas especiais (ex: aniversários)

### 3.4 Palmarés

- Prémios ganhos pela Tunadão em outros festivais
- Organizados por ano
- Para cada festival:
  - Nome do festival
  - Localização
  - Lista de prémios

### 3.5 Blog/Eventos

- Artigos sobre eventos, atuações, notícias
- Listagem com paginação
- Categorias/tags

### 3.6 Vídeos

- Embed de vídeos do YouTube
- Organizados por categoria ou cronologia

### 3.7 Música

- Discografia/álbuns
- Links para Spotify
- Informação sobre cada álbum

### 3.8 Contacto

- Formulário de contacto
- Informações de contacto
- Links para redes sociais

---

## 4. Estrutura de Conteúdo (PayloadCMS Collections)

### 4.1 Core Collections

#### Users

- email (required)
- password
- role: admin | editor

#### Media

- file (image/video)
- alt text
- caption

### 4.2 Content Collections

#### AwardTypes (Tipos de Prémios)

> Para permitir tooltip/descrição consistente entre Citadão e Palmarés

- name (ex: "Melhor Pandeireta")
- aliases (array de nomes alternativos)
- description (o que é avaliado)
- criteria (critérios de avaliação)
- slug

#### CitadaoEditions

- edition (número)
- year
- date (string, ex: "4-5 Maio")
- venue
- poster (Media)
- tunas (array de strings)
- guests (array de strings)
- awards (relação com AwardTypes + vencedor)
- notes
- status: draft | published

#### PalmaresYears

- year
- festivals (array):
  - name
  - location
  - awards (relação com AwardTypes)
- status: draft | published

#### BlogPosts

- title
- slug
- excerpt
- content (rich text)
- featuredImage (Media)
- publishedAt
- author
- tags
- status: draft | published

#### Videos

- title
- youtubeUrl
- description
- category
- publishedAt
- status: draft | published

#### Albums

- title
- year
- coverImage (Media)
- description
- spotifyUrl
- tracks (array de strings)
- status: draft | published

#### Pages (para conteúdo estático)

- title
- slug
- content (rich text)
- seoTitle
- seoDescription

### 4.3 Globals

#### SiteSettings

- siteName
- logo
- favicon
- socialLinks:
  - instagram
  - facebook
  - tiktok
  - youtube
  - spotify

#### ContactInfo

- email
- phone
- address

---

## 5. Funcionalidades

### 5.1 Frontend

- [x] Mobile-first, responsive
- [x] Dark mode (toggle)
- [x] SEO completo (meta tags, Open Graph)
- [x] Sitemap automático
- [x] Performance otimizada (Core Web Vitals)
- [x] i18n preparado (PT/EN para conteúdo estático)

### 5.2 CMS

- [x] Autenticação (admin, editor)
- [x] CRUD para todas as collections
- [x] Upload de media
- [x] Preview de conteúdo
- [x] Roles e permissões

### 5.3 Formulário de Contacto

- [x] Validação client-side
- [x] Submissão real para o CMS (`POST /api/contact-submissions` via `PUBLIC_CMS_URL`)
- [x] Armazenamento no CMS
- [x] Envio de notificação por email via Resend (campos HTML-escaped)
- [x] Anti-abuso: Cloudflare Turnstile (verificação server-side do token)
- [x] Honeypot silencioso (aceita em silêncio, sem notificação, sem revelar deteção)
- [x] Limites de comprimento server-side (name/email/subject/message)

### 5.4 Autenticação CMS

- [x] Login/Logout
- [x] Recuperação de password via email (Resend)

---

## 6. Design

### 6.1 Estilo

- Moderno com toques minimalistas
- Inspirado nos templates HTML5UP referenciados

### 6.2 Cores

- **Primária:** #29166F (Azul escuro do logo)
- **Secundária:** #BF0029 (Vermelho/bordô)
- **Neutro:** #888B8B (Cinzento)
- **Background:** #FFFFFF / #F8F9FA (branco/off-white)
- **Dark mode:** Inversão adequada com backgrounds escuros

### 6.3 Tipografia

- Fonte moderna, legível
- Hierarquia clara

### 6.4 UI Components

- CSS estruturado com variáveis (design tokens)
- Componentes reutilizáveis
- Facilmente adaptável

---

## 7. Dados Existentes

### Localização: `/Users/xico/Downloads/Tunadão/TUNA_SITE_DATA_BACKUP/`

```
├── data/
│   ├── citadao-editions.json  (18 edições, 2004-2025)
│   └── palmares.json          (prémios 1999-2019)
├── logo/
│   ├── Tunadao - logo.ai
│   ├── Tunadao 1998 - logo.svg
│   └── tunadao logo - large.png
└── posters/
    └── citadao-YYYY-NN-poster.jpg (18 posters)
```

### Prémios identificados nos dados

- Melhor Tuna
- 2ª/3ª Melhor Tuna
- Tuna Mais Tuna / Tuna + Tuna
- Tuna do Público
- Melhor Serenata
- Melhor Passacalles
- Melhor Pandeireta
- Melhor Instrumental
- Melhor Solista
- Melhor Original / Melhor Tema Original
- Melhor Estandarte / Melhor Bandeira
- Melhor Porta-Estandarte
- Menção Honrosa
- Prémio Ibero-Americano
- Prémio de Participação

---

## 8. Infraestrutura

### 8.1 Hosting

- **Frontend (Astro):** GitHub Pages (gratuito, estático)
- **CMS (PayloadCMS):** Render.com (free tier - 750h/mês)

### 8.2 Base de Dados

- Turso (SQLite na edge, free tier generoso)

### 8.3 Email

- **Produção:** Resend (3000 emails/mês grátis)
- **Desenvolvimento:** MailDev (captura emails localmente)
- **Uso:** Formulário de contacto + Recuperação de password

### 8.4 Analytics (gratuito)

- Google Analytics 4 (grátis)
- Alternativa: Umami (self-hosted, grátis)
- Alternativa: Plausible Cloud (~9€/mês, não grátis)

---

## 9. CI/CD

### GitHub Actions Workflows

1. **Lint & Type Check** - Em cada PR
2. **Unit Tests (Vitest)** - Em cada PR
3. **E2E Tests (Playwright)** - Em cada PR
4. **Build & Deploy Frontend** - On merge to main
5. **Deploy CMS** - On merge to main (se aplicável)

---

## 10. Testes

### 10.1 Unit Tests (Vitest)

- Utility functions
- Component logic
- Data transformations

### 10.2 E2E Tests (Playwright)

- Navegação entre páginas
- Formulário de contacto
- Responsive design
- Dark mode toggle
- SEO elements presentes

---

## 11. Internacionalização (i18n)

### Abordagem

- Conteúdo estático (labels, navegação, etc.): PT e EN
- Conteúdo do CMS (blog, descrições): Apenas PT (por agora)

### Estrutura

```
/src/i18n/
  ├── pt.json
  └── en.json
```

---

## 12. Informação Recolhida

### 12.1 Contacto

- **Email:** <tunadao@gmail.com>
- **Telefone:** +351 928 155 399
- **Morada:** Campus Politécnico de Viseu, 3504-510

### 12.2 Redes Sociais

- **Facebook:** <https://www.facebook.com/tunadao1998>
- **Instagram:** <https://www.instagram.com/tunadao1998/>
- **TikTok:** <https://www.tiktok.com/@tunadao1998>
- **YouTube:** <https://www.youtube.com/@TUNADAO1998>

### 12.3 Música/Spotify

- **Spotify:** <https://open.spotify.com/artist/7HeYIxlV5Nb1KvZkBx00sH>
- **Álbuns:**
  - 2003 - "Por Ruelas e Calçadas" (gravado ao vivo)
  - 2008 - "De Capa Bem Traçada" (gravado em estúdio)

### 12.4 Vídeos

- Canal YouTube disponível
- Vídeos serão selecionados manualmente no CMS

### 12.5 História/Sobre Nós

**Fonte:** PDF do Historial

**Resumo da História:**

- **Fundação:** 3 de Maio de 1998
- **Primeira apresentação:** XIV Semana Académica de Viseu
- **Origem:** Desafio da Associação de Estudantes da ESTV ao presidente para criar uma tuna do ISPV
- **Hino da Academia:** "Viseu Graciosa" (autor: João Oliveira, ~1999)
- **Nome "TUNADÃO 1998":** Adotado em 2004, ligação à Região Demarcada do Dão
- **CITADÃO:** Primeiro festival em 2004 (Certame Internacional de Tunas Académicas do Dão)
- **1º CD:** 2003 - "Por Ruelas e Calçadas"
- **2º CD:** 2008 - "De Capa Bem Traçada"
- **1ª Internacionalização:** 2014 (Andorra)
- **20 Anos:** Espetáculo Teatro Viriato (13 Julho 2018)
- **25 Anos:** Espetáculo Teatro Viriato (24 Fevereiro 2024)
- **1ª Digressão Espanha:** 3-9 Junho 2024
- **Viagens ilhas:** Açores (2006, 2010, 2013), Madeira (2008, 2011)
- **Membros atuais:** ~60 tunos
- **Hierarquia:** Tuno-Mestre > Tunos Ilustres > Tunos Doutores/Engenheiros/Enfermeiros > Tunos > Caloiros > Aprendizes

### 12.6 Cores (extraídas do SVG)

- **Azul Escuro (Primária):** #29166F (rgb 16.1%, 8.6%, 43.5%)
- **Vermelho/Bordô:** #BF0029 (rgb 74.9%, 0%, 16.1%)
- **Cinzento:** #888B8B (rgb 53.3%, 54.9%, 54.5%)
- **Background:** Branco/off-white

### 12.7 CMS Hosting

- **Decisão:** Render.com (free tier, compatível com PayloadCMS + Turso)

### 12.8 Fotos Disponíveis

**Localização:** `/Users/xico/Downloads/Tunadão/TUNA_SITE_DATA_BACKUP/FOTOS/`

- 8 fotos do grupo disponíveis
- Foto principal: `tunadao foto - principal.jpg`

---

## 13. Roadmap de Implementação

### Fase 1: Setup

- [x] Inicializar projeto Astro
- [x] Configurar TypeScript, ESLint, Prettier
- [x] Configurar PayloadCMS com Turso (SQLite)
- [x] Setup GitHub Actions básico

### Fase 2: CMS

- [x] Criar todas as collections
- [x] Configurar autenticação e roles
- [x] Criar scripts de seed para dados existentes (Citadão e Palmarés)

### Fase 3: Frontend Base

- [x] Layout base (header, footer, navigation)
- [x] Sistema de design (tokens, componentes base)
- [x] Configurar dark mode
- [x] Configurar i18n

### Fase 4: Páginas

- [x] Home
- [x] Sobre Nós
- [x] Citadão
- [x] Palmarés
- [x] Blog
- [x] Vídeos
- [x] Música
- [x] Contacto

### Fase 5: Polish

- [x] SEO (meta tags, sitemap, robots.txt)
- [x] Performance optimization (build otimizado)
- [x] Acessibilidade (skip links, ARIA labels)
- [x] Testes unitários (Vitest)
- [x] Testes E2E (Playwright configurado)

### Fase 6: Deploy

- [x] Configurar deploy CMS (Render.com) - render.yaml criado
- [x] Configurar deploy Frontend (GitHub Pages) - workflow criado
- [ ] Deploy efetivo (requer push para GitHub)
- [ ] Configurar webhooks para rebuild

---

## Changelog

| Data       | Alteração                                                                |
| ---------- | ------------------------------------------------------------------------ |
| 2026-01-18 | Documento inicial criado                                                 |
| 2026-01-18 | Adicionada toda a informação de contacto, redes sociais, cores, história |
| 2026-01-18 | CI/CD configurado (GitHub Actions + Render.yaml)                         |
