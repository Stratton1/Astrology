# COSMOS — Multi-Tradition Astrology Platform

COSMOS is an open-source astrology platform providing astronomically accurate chart calculations, interactive SVG visualizations, and AI-powered interpretive synthesis across Western, Vedic (Jyotish), and Hellenistic traditions.

## Architecture

```
apps/
  web/        → Next.js 14 frontend (TypeScript, Tailwind, D3.js)
  api/        → Express API gateway (TypeScript, Prisma, PostgreSQL, Redis)
  calc/       → Python calculation engine (FastAPI, Swiss Ephemeris)
packages/
  types/      → Shared TypeScript types and Zod schemas
  ui/         → Shared React component library
  traditions/ → Tradition-specific configuration data
```

## Prerequisites

- Node.js 20+
- pnpm 8+
- Python 3.11+
- Docker & Docker Compose (for PostgreSQL and Redis)

## Quick Start

```bash
# Install dependencies
pnpm install

# Start infrastructure
docker-compose up -d

# Start all services in dev mode
pnpm dev

# Run tests
pnpm test

# Type check
pnpm typecheck

# Lint
pnpm lint

# Build all packages
pnpm build
```

## Environment Variables

Copy `.env.example` to `.env` in the root and each app directory. See `/docs/ENVIRONMENT_VARIABLES.md` for details.

## Repository Structure

```
/
├── apps/
│   ├── web/                  → Next.js 14 frontend
│   ├── api/                  → Express API gateway
│   └── calc/                 → Python calculation engine
├── packages/
│   ├── types/                → Shared TypeScript types and Zod schemas
│   ├── ui/                   → Shared React component library
│   └── traditions/           → Tradition-specific configuration data
├── docs/
│   ├── MASTER_BLUEPRINT_v2.md
│   ├── DEVELOPMENT_ROADMAP_v2.md
│   ├── DECISIONS.md
│   ├── BUILD_PROMPTS_v2.md
│   ├── SECURITY.md
│   ├── TEST_STRATEGY.md
│   └── ENVIRONMENT_VARIABLES.md
├── .claude/
│   ├── CLAUDE.md
│   ├── ARCHITECTURE.md
│   ├── TRADITIONS.md
│   ├── API.md
│   ├── FRONTEND.md
│   ├── CALCULATION.md
│   └── EXECUTION_RULES.md
├── RULES.md                  → Repository operating manual
├── PROJECT_SUMMARY.md        → Current state briefing
├── BUILD_LOG.md              → Chronological change diary
├── README.md                 → This file
├── turbo.json
├── pnpm-workspace.yaml
├── package.json
├── docker-compose.yml
└── .env.example
```

## Documentation Map

| Document | Path | Purpose |
|----------|------|---------|
| Master Blueprint | /docs/MASTER_BLUEPRINT_v2.md | Architecture & product spec |
| Development Roadmap | /docs/DEVELOPMENT_ROADMAP_v2.md | Phased execution plan |
| Decisions Log | /docs/DECISIONS.md | Architectural decision records |
| Build Prompts | /docs/BUILD_PROMPTS_v2.md | Sequential build instructions |
| Security | /docs/SECURITY.md | Security model & practices |
| Test Strategy | /docs/TEST_STRATEGY.md | Testing approach |
| Rules | /RULES.md | Repository operating manual |
| Project Summary | /PROJECT_SUMMARY.md | Current state briefing |
| Build Log | /BUILD_LOG.md | Chronological change diary |

## Key Design Decisions

- **Calculation accuracy first** — Swiss Ephemeris for astronomical precision
- **Multi-tradition native** — Not a Western-first bolt-on; traditions are first-class
- **Privacy by design** — Birth data encrypted at rest, PII redacted from logs
- **AI synthesis as enhancement** — Charts work without AI; synthesis adds interpretive depth

## Security & Privacy

Birth data (dates, times, locations) is encrypted at rest using AES-256-GCM field-level encryption. PII is never logged. See `/docs/SECURITY.md`.

## Contributing

1. Create a feature branch
2. Follow rules in `/RULES.md`
3. Ensure all CI checks pass
4. Update documentation
5. Add `BUILD_LOG.md` entry

## License

[TBD]
