# COSMOS — Development Roadmap v2

> Version: 2.0 | Created: 2026-03-22 | Status: Living Document

## Overview

Phased, dependency-aware roadmap. Testing and documentation built into every phase. Must-have features distinguished from nice-to-have.

## Dependency Graph

```
Phase 1 (Foundation)
  └─▶ Phase 2 (Calc Engine)
       └─▶ Phase 3 (API Layer)
            └─▶ Phase 4 (Frontend)
                 └─▶ Phase 5 (AI Synthesis)
                      └─▶ Phase 6 (Multi-Tradition)
                           └─▶ Phase 7 (Hardening & Launch)
```

---

## Phase 1: Foundation ✅ IN PROGRESS

**Objective:** Establish monorepo, shared types, CI, documentation foundation.

**Deliverables:**
- Turborepo + pnpm workspace
- packages/types with TypeScript interfaces and Zod schemas
- packages/traditions with tradition configs
- packages/ui scaffold
- CI pipeline (GitHub Actions)
- Docker Compose (PostgreSQL, Redis)
- Complete v2 documentation set
- .env.example

**Technical Tasks:**
1. Initialize Turborepo with pnpm-workspace.yaml
2. Create tsconfig.base.json with strict mode
3. Configure ESLint + Prettier
4. Create packages/types with all shared models and Zod schemas
5. Create packages/traditions with Western, Vedic, Hellenistic configs
6. Create packages/ui with foundational components
7. Create Docker Compose for local PostgreSQL + Redis
8. Create GitHub Actions CI workflow

**Documentation Tasks:**
- All v2 docs, .claude/ files, RULES.md, PROJECT_SUMMARY.md, BUILD_LOG.md, README.md

**Testing Tasks:**
- CI pipeline runs lint + typecheck
- Zod schema validation tests

**Acceptance Criteria:**
- `pnpm install && pnpm build && pnpm lint && pnpm typecheck` all pass
- All documentation files exist
- Docker Compose starts PostgreSQL and Redis

**Status:** In Progress

---

## Phase 2: Calculation Engine

**Objective:** Python calc service with Swiss Ephemeris for natal chart calculations.

**Deliverables:**
- FastAPI service scaffold
- Swiss Ephemeris wrapper (pyswisseph)
- Natal chart calculation: planets, houses, aspects
- Western tropical support first
- Reference chart validation tests
- Dockerfile

**Technical Tasks:**
1. Create FastAPI app structure
2. Implement Swiss Ephemeris wrapper (planet positions)
3. Implement house calculation (6 house systems)
4. Implement aspect calculation with configurable orbs
5. Implement Julian Day conversion with timezone handling
6. Handle birth time unknown (noon chart, flag houses)
7. Create Pydantic request/response models
8. Create POST /calculate/natal endpoint
9. Write reference validation tests (known celebrity charts)

**Must-have:** Natal positions, houses (Placidus + Whole Sign), major aspects
**Nice-to-have:** Asteroid positions, minor aspects, heliocentric

**Testing Tasks:**
- pytest suite for ephemeris functions
- Reference chart validation (≤1 arcminute accuracy)
- Edge cases: Arctic latitudes, historical dates, unknown birth time

**Acceptance Criteria:**
- Calculate natal chart for 5+ reference charts
- All planetary positions within 1 arcminute of published ephemeris
- pytest passes with >80% coverage on core module

**Dependencies:** Phase 1 complete

---

## Phase 3: API Layer

**Objective:** Express API gateway with auth, storage, and calc proxy.

**Deliverables:**
- Express + TypeScript scaffold
- Prisma schema + migrations
- JWT authentication (register, login, refresh)
- Profile CRUD with encrypted birth data
- Chart calculation endpoint (proxy to calc)
- Redis caching
- Rate limiting, error handling
- Health endpoints

**Technical Tasks:**
1. Express app with middleware stack
2. Prisma schema (User, Profile, Chart, Synthesis)
3. Auth routes with bcrypt + JWT
4. Profile CRUD with AES-256-GCM encryption
5. Chart calculation route (proxy to calc service, cache in Redis)
6. Error handler middleware with standard envelope
7. Rate limiting (express-rate-limit + Redis)
8. Request ID + correlation logging (pino)
9. Health + readiness endpoints

**Testing Tasks:**
- Vitest + supertest for all API routes
- Auth flow integration tests
- Encryption/decryption unit tests
- Rate limiting behavior tests

**Acceptance Criteria:**
- Full auth flow works (register → login → access protected routes)
- Profile CRUD with encrypted storage verified
- Chart calculation proxied to calc service and cached
- All routes return standard error envelope on failure

**Dependencies:** Phase 1 types, Phase 2 calc service

---

## Phase 4: Frontend Foundation

**Objective:** Next.js app with chart input, rendering, and profile management.

**Deliverables:**
- Next.js 14 App Router scaffold
- Birth data input form with geocoding
- SVG natal chart wheel (D3.js)
- Chart data tables
- Auth flows (login/register)
- Profile management
- Responsive layout, dark mode

**Technical Tasks:**
1. Next.js App Router with layout and routing
2. Tailwind CSS with dark mode theme
3. Birth data form (react-hook-form + Zod)
4. Geocoding autocomplete (OpenCage API)
5. D3.js SVG chart wheel component
6. Planet positions table component
7. Auth pages (login, register)
8. Dashboard with profile list
9. Chart view page with wheel + data
10. Zustand store for auth state
11. TanStack Query for server state

**Testing Tasks:**
- Component rendering tests (Vitest + React Testing Library)
- Form validation tests
- Auth state management tests

**Acceptance Criteria:**
- User can register, login, create profile, calculate chart, view chart
- Chart wheel renders correctly with planet glyphs and house divisions
- Responsive on mobile, tablet, desktop
- Dark mode works

**Dependencies:** Phase 3 API

---

## Phase 5: AI Synthesis

**Objective:** AI-powered chart interpretation.

**Deliverables:**
- BullMQ queue setup
- Synthesis prompt templates per tradition
- Claude API integration
- Synthesis endpoint + status polling
- Frontend synthesis display with loading states
- Fallback templates for AI failure

**Technical Tasks:**
1. BullMQ queue configuration
2. Synthesis worker with Claude API integration
3. Prompt template system (structured, tradition-specific)
4. POST /synthesis/generate endpoint (returns jobId)
5. GET /synthesis/status/:jobId polling endpoint
6. Synthesis result caching in Redis
7. Frontend synthesis panel with loading/retry
8. Fallback template text when AI unavailable

**Acceptance Criteria:**
- Submit chart for synthesis → receive jobId
- Poll until completion → display interpretation
- Fallback works when AI is unavailable
- Synthesis cached for subsequent views

**Dependencies:** Phase 3 API, Phase 4 frontend

---

## Phase 6: Multi-Tradition Expansion

**Objective:** Vedic and Hellenistic tradition support.

**Deliverables:**
- Sidereal coordinate calculation in calc service
- Ayanamsha support (Lahiri, Raman, Krishnamurti)
- Vedic features (nakshatras, Vimshottari dasha)
- Hellenistic features (sect, bounds, Lot of Fortune)
- Tradition-specific UI adaptations
- Tradition-specific synthesis prompts

**Dependencies:** Phases 2-5 stable

---

## Phase 7: Hardening & Launch

**Objective:** Production readiness.

**Deliverables:**
- E2E tests (Playwright)
- Performance optimization (bundle size, caching, lazy loading)
- Security audit
- Accessibility audit
- Production deployment configuration
- Monitoring and alerting
- Documentation polish

**Dependencies:** Phase 6

---

## Post-Launch Backlog

1. Synastry (relationship) charts
2. Composite charts
3. Solar return charts
4. Secondary progressions
5. Transit alerts / notifications
6. Chart comparison view
7. Data export (PDF, JSON)
8. API rate tier plans
9. PWA / offline support
10. Community features
11. Additional asteroids
12. Fixed stars
13. Horary chart support
14. Electional chart support
15. OpenAPI documentation
