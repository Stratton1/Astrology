# COSMOS — Repository Structure

```
/
├── apps/
│   ├── web/                    # Next.js 14 frontend
│   │   ├── app/                # App Router pages
│   │   ├── components/         # App-specific components
│   │   ├── lib/                # Utilities, API client
│   │   ├── public/             # Static assets
│   │   ├── Dockerfile
│   │   ├── next.config.js
│   │   ├── tailwind.config.ts
│   │   ├── tsconfig.json
│   │   └── package.json
│   ├── api/                    # Express API gateway
│   │   ├── src/
│   │   │   ├── routes/         # Route handlers
│   │   │   ├── middleware/     # Auth, validation, error handling
│   │   │   ├── services/      # Business logic, synthesis
│   │   │   ├── lib/           # Utilities, encryption, cache
│   │   │   └── index.ts       # Entry point
│   │   ├── prisma/
│   │   │   └── schema.prisma  # Database schema
│   │   ├── Dockerfile
│   │   ├── tsconfig.json
│   │   └── package.json
│   └── calc/                   # Python calculation engine
│       ├── app/
│       │   ├── api/            # FastAPI routes
│       │   ├── core/           # Swiss Ephemeris wrapper
│       │   ├── models/         # Pydantic models
│       │   └── main.py         # Entry point
│       ├── tests/
│       │   └── reference_charts/
│       ├── Dockerfile
│       ├── pyproject.toml
│       └── requirements.txt
├── packages/
│   ├── types/                  # Shared TypeScript types & Zod schemas
│   │   ├── src/
│   │   │   ├── models/         # Entity types
│   │   │   ├── api/            # Request/response types
│   │   │   ├── calc/           # Calculation types
│   │   │   └── index.ts        # Barrel export
│   │   ├── tsconfig.json
│   │   └── package.json
│   ├── ui/                     # Shared React components
│   │   ├── src/
│   │   │   ├── components/
│   │   │   └── index.ts
│   │   ├── tsconfig.json
│   │   └── package.json
│   └── traditions/             # Tradition configuration data
│       ├── src/
│       │   ├── western.ts
│       │   ├── vedic.ts
│       │   ├── hellenistic.ts
│       │   └── index.ts
│       ├── tsconfig.json
│       └── package.json
├── docs/
│   ├── MASTER_BLUEPRINT_v2.md
│   ├── DEVELOPMENT_ROADMAP_v2.md
│   ├── DECISIONS.md
│   ├── BUILD_PROMPTS_v2.md
│   ├── SECURITY.md
│   ├── TEST_STRATEGY.md
│   ├── DEPLOYMENT.md
│   ├── ENVIRONMENT_VARIABLES.md
│   ├── REPO_STRUCTURE.md
│   └── KNOWN_LIMITATIONS.md
├── .claude/
│   ├── CLAUDE.md
│   ├── ARCHITECTURE.md
│   ├── TRADITIONS.md
│   ├── API.md
│   ├── FRONTEND.md
│   ├── CALCULATION.md
│   └── EXECUTION_RULES.md
├── .github/
│   └── workflows/
│       └── ci.yml
├── docker-compose.yml
├── turbo.json
├── pnpm-workspace.yaml
├── package.json
├── tsconfig.base.json
├── .env.example
├── .gitignore
├── .prettierrc
├── .eslintrc.js
├── RULES.md
├── PROJECT_SUMMARY.md
├── BUILD_LOG.md
└── README.md
```

## Directory Responsibilities

### apps/web
Next.js 14 frontend using the App Router. Handles all user-facing UI: authentication flows, profile management, chart request forms, chart visualization, and AI synthesis display. Communicates exclusively with apps/api.

### apps/web/app
App Router page segments, layouts, and server components. Each route segment maps to a URL path.

### apps/web/components
React components specific to the web app (not shared). Includes chart renderers, form components, and layout elements.

### apps/web/lib
Client-side utilities: typed API client (fetch wrapper), auth helpers, date formatting, and other shared logic used across web components.

### apps/api
Express.js API gateway and business logic layer. Handles authentication, authorization, input validation, PII encryption, caching, and proxies calculation requests to apps/calc. The sole entry point for the web frontend.

### apps/api/src/routes
Express route handlers organized by resource (auth, profiles, charts, synthesis). Each file defines the HTTP interface for one resource area.

### apps/api/src/middleware
Cross-cutting concerns applied to routes: JWT authentication, Zod-based request validation, rate limiting, and centralized error handling.

### apps/api/src/services
Business logic modules: chart orchestration, AI synthesis via Anthropic SDK, geocoding via OpenCage, and other non-trivial operations that sit above raw data access.

### apps/api/src/lib
Infrastructure utilities: AES-256-GCM encryption/decryption, Redis cache client, pino logger configuration, and other low-level helpers.

### apps/api/prisma
Prisma ORM schema and generated migrations for PostgreSQL. The schema.prisma file is the source of truth for the database structure.

### apps/calc
Python FastAPI service wrapping the Swiss Ephemeris (pyswisseph). Performs all astrological calculations: planetary positions, house cusps, aspects, and sidereal offsets. Stateless; called by apps/api.

### apps/calc/app/api
FastAPI route handlers. Exposes endpoints for chart calculation and health checks. Validates requests with Pydantic models.

### apps/calc/app/core
Core calculation logic: Swiss Ephemeris initialization and wrapper functions, house system implementations, aspect computation, and ayanamsa (sidereal offset) handling.

### apps/calc/app/models
Pydantic v2 models for request and response payloads. Shared between API layer and core calculation layer.

### apps/calc/tests/reference_charts
JSON fixtures containing known chart data (celebrity birth charts with published verified positions) used as ground truth in accuracy tests.

### packages/types
Single source of truth for TypeScript types and Zod validation schemas shared between apps/web and apps/api. Published as an internal workspace package. Prevents type drift between frontend and backend.

### packages/types/src/models
TypeScript interfaces and Zod schemas for core domain entities: User, Profile, Chart, Synthesis, and their database representations.

### packages/types/src/api
Types and schemas for API request bodies and response envelopes. Used by both the API for validation and the web client for typed fetch calls.

### packages/types/src/calc
Types representing astrological calculation inputs and outputs: PlanetPosition, HouseCusp, AspectData, ChartRequest, ChartResult.

### packages/ui
Shared React component library used by apps/web. Contains design-system-level primitives (Button, Input, Card, Modal) and potentially chart visualization components if reuse is anticipated.

### packages/traditions
Static configuration data for each supported astrological tradition (Western Tropical, Vedic/Jyotish, Hellenistic). Defines which planets, house systems, aspects, and orbs each tradition uses. Consumed by both apps/api and apps/calc.

### docs
Human-readable documentation for the project: architecture blueprints, development roadmap, decision log, build prompts, security model, test strategy, deployment guide, environment variable reference, repo structure, and known limitations.

### .claude
Context files for AI-assisted development. Each file provides scoped instructions and architecture details for a specific domain (API design, frontend patterns, calculation logic, etc.) to maintain consistency across AI-assisted coding sessions.

### .github/workflows
GitHub Actions CI/CD pipeline definitions. Runs linting, type checking, unit tests, and integration tests on every pull request.
