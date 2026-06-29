# Tunadão 1998 Website

Website institucional da **Tunadão** - Tuna do Instituto Politécnico de Viseu.

## Stack

| Component     | Technology                                            | Hosting                                   |
| ------------- | ----------------------------------------------------- | ----------------------------------------- |
| Frontend      | [Astro](https://astro.build/) (SSG)                   | [GitHub Pages](https://pages.github.com/) |
| CMS           | [PayloadCMS](https://payloadcms.com/) 3.0             | [Render.com](https://render.com/)         |
| Database      | SQLite via [Turso](https://turso.tech/)               | Turso (edge)                              |
| Media Storage | Images & files                                        | [Cloudinary](https://cloudinary.com/)     |
| CI/CD         | [GitHub Actions](https://github.com/features/actions) | GitHub                                    |
| Tests         | Vitest + Playwright                                   | GitHub Actions                            |

## Features

- **Bilingual** (PT/EN) with i18n routing
- **Static Site Generation** - fast, SEO-friendly
- **Headless CMS** - content managed via PayloadCMS admin panel
- **Automatic rebuilds** - frontend rebuilds when CMS content changes
- **Responsive design** - works on all devices

## Project Structure

This is a monorepo with two self-contained projects:

```
├── app/                    # Astro frontend (self-contained)
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── data/           # Static data (editions, etc.)
│   │   ├── i18n/           # Translations
│   │   ├── layouts/        # Page layouts
│   │   ├── lib/cms/        # CMS client, types & fixtures
│   │   ├── pages/          # Route pages
│   │   └── styles/         # Global styles
│   ├── public/             # Static assets
│   ├── .env.development    # Dev defaults (auto-loaded)
│   └── package.json
├── cms/                    # PayloadCMS backend (self-contained)
│   ├── src/
│   │   ├── collections/    # Content types
│   │   ├── globals/        # Site settings
│   │   └── utils/          # Utilities (rebuild triggers)
│   └── package.json
├── e2e/                    # Playwright E2E tests
├── package.json            # Root: workspaces + e2e
└── playwright.config.ts
```

## Pages

- **Home** - Hero, highlights, recent news
- **Sobre Nós** - History since 1998
- **Citadão** - Festival editions (2004-present)
- **Palmarés** - Awards won at other festivals
- **Blog** - News and events
- **Vídeos** - YouTube embeds
- **Música** - Discography & Spotify links
- **Contacto** - Contact form

## Quick Start

### Prerequisites

- Node.js 20+
- npm

### Development

```bash
# Install all dependencies (uses npm workspaces)
npm install

# Start frontend (http://localhost:4321)
npm run dev -w app

# Start CMS in another terminal (http://localhost:3000)
npm run dev -w cms
```

### Environment Variables

Development defaults are in `app/.env.development` (auto-loaded by Astro).

For CMS, copy the example:

```bash
cp cms/.env.example cms/.env
```

**Frontend (app/):**
| Variable | Description | Default |
|----------|-------------|---------|
| `CMS_URL` | PayloadCMS API URL | `http://localhost:3000` |
| `USE_TEST_FIXTURES` | Use static fixtures instead of CMS | `false` |

**CMS (cms/.env):** See [DEPLOY.md](./DEPLOY.md) for full list.

## Scripts

### Root (all workspaces)

```bash
npm run lint          # Check linting in all workspaces
npm run lint:fix      # Fix lint issues
npm run format        # Check formatting
npm run format:fix    # Fix formatting
npm run typecheck     # TypeScript check
npm run test          # Run unit tests
npm run build         # Build all workspaces
npm run test:e2e      # Run Playwright E2E tests
```

### Workspace-specific

```bash
# Frontend (app/)
npm run dev -w app        # Start dev server
npm run build -w app      # Build static site
npm run preview -w app    # Preview build

# CMS (cms/)
npm run dev -w cms        # Start CMS server
npm run build -w cms      # Build CMS
```

### Component Development

A component showcase page is available at `/dev/components` during development. This page:

- Displays all UI components with their variants
- Built and served as static HTML in all environments (not excluded from the production build)
- In production, a client-side script redirects visitors to the site root unless `?preview=1`
  or `?dev=true` is present in the URL
- Marked `noindex, nofollow` so search engines do not index it
- Because the redirect is client-side, JS-disabled clients and crawlers still receive the page HTML
- Supports theme toggle to test light/dark modes

```bash
# Start dev server and visit
npm run dev -w app
# Open http://localhost:4321/dev/components
```

To add new components to the showcase, edit `app/src/pages/dev/components.astro`.

## Deployment

See [DEPLOY.md](./DEPLOY.md) for detailed deployment instructions.

**TL;DR:**

- Frontend deploys to GitHub Pages on push to `main`
- CMS deploys to Render.com
- CMS content changes auto-trigger frontend rebuilds

## Architecture

```
┌─────────────────┐     Build Time      ┌─────────────────┐
│   PayloadCMS    │ ──────────────────► │   Astro (SSG)   │
│   (Render.com)  │    Fetch content    │ (GitHub Pages)  │
└────────┬────────┘                     └─────────────────┘
         │
         │ afterChange hook
         ▼
┌─────────────────┐
│  GitHub Actions │ ──► Rebuild & Deploy
└─────────────────┘
```

## Services

| Service            | Purpose                   | Free Tier         |
| ------------------ | ------------------------- | ----------------- |
| **GitHub Pages**   | Host static Astro site    | ✅ Unlimited      |
| **Render.com**     | Host PayloadCMS backend   | ✅ 750h/month     |
| **Turso**          | SQLite database (edge)    | ✅ 9GB storage    |
| **Cloudinary**     | Image/media storage & CDN | ✅ 25GB storage   |
| **GitHub Actions** | CI/CD pipeline            | ✅ 2000 min/month |

### Required Secrets (GitHub)

| Secret                   | Description                                                          |
| ------------------------ | -------------------------------------------------------------------- |
| `CMS_URL`                | Production PayloadCMS URL (e.g., `https://tunadao-cms.onrender.com`) |
| `RENDER_DEPLOY_HOOK_URL` | (Optional) Render deploy hook for CMS deploys                        |
| `TURSO_DB_NAME`          | Turso database name (for backups)                                    |
| `TURSO_API_TOKEN`        | Turso API token (for backups)                                        |

### Required Environment Variables (Render)

| Variable                    | Description                              |
| --------------------------- | ---------------------------------------- |
| `PAYLOAD_PUBLIC_SERVER_URL` | CMS public URL                           |
| `PAYLOAD_SECRET`            | JWT secret (auto-generated)              |
| `TURSO_DATABASE_URL`        | Turso connection string (`libsql://...`) |
| `TURSO_AUTH_TOKEN`          | Turso auth token                         |
| `CLOUDINARY_CLOUD_NAME`     | Cloudinary cloud name                    |
| `CLOUDINARY_API_KEY`        | Cloudinary API key                       |
| `CLOUDINARY_API_SECRET`     | Cloudinary API secret                    |
| `FRONTEND_URL`              | Astro site URL (for CORS)                |
| `RESEND_API_KEY`            | (Optional) For email notifications       |

## Backups

Database backups run automatically via GitHub Actions (daily at 3 AM UTC).

- **Retention**: 90 days (stored as GitHub artifacts)
- **Manual trigger**: Go to Actions → Database Backup → Run workflow
- **Restore**: Download artifact and run `turso db create restored-db --from-dump ./backup.sql`

## License

Private - Tunadão 1998
