# COSMOS — Build Prompts v2

> Sequential, dependency-aware build prompts. Each builds on previous outputs.

---

## BP-01: Initialize Monorepo

**Objective:** Set up Turborepo monorepo with pnpm workspace.
**Prerequisites:** None
**Instruction:** Create root package.json, turbo.json, pnpm-workspace.yaml, tsconfig.base.json, .eslintrc.js, .prettierrc, .gitignore, docker-compose.yml (PostgreSQL + Redis), .env.example. Configure Turborepo pipeline for build/dev/lint/typecheck/test/clean.
**Expected Outputs:** Root config files, Docker Compose, workspace ready for packages.
**Validation:** `pnpm install` succeeds. `docker-compose up -d` starts PostgreSQL and Redis.
**Docs Update:** README.md, PROJECT_SUMMARY.md, BUILD_LOG.md

---

## BP-02: Shared Types Package

**Objective:** Create packages/types with all TypeScript interfaces and Zod schemas.
**Prerequisites:** BP-01
**Instruction:** Create @cosmos/types with: BirthData, PlanetPosition, HousePosition, AspectData, ChartCalculation, User, Profile, Synthesis types. Zod schemas for all. Enums for CoordinateSystem, HouseSystem, Tradition, ChartType, Ayanamsha, Planet, ZodiacSign, AspectType. API request/response types. Barrel exports.
**Expected Outputs:** packages/types/src/ with models/ and api/ directories.
**Validation:** `pnpm typecheck` passes. Types importable from @cosmos/types.
**Docs Update:** ARCHITECTURE.md

---

## BP-03: Traditions Package

**Objective:** Create packages/traditions with tradition configuration data.
**Prerequisites:** BP-02
**Instruction:** Create @cosmos/traditions with Western, Vedic, Hellenistic configs. Each includes: coordinate system, default house system, aspect orbs, planet list, rulerships, dignities (exaltation/detriment/fall), supported features. Export getTraditionConfig() function.
**Expected Outputs:** packages/traditions/src/ with western.ts, vedic.ts, hellenistic.ts.
**Validation:** Types compile. All traditions have required fields.
**Docs Update:** TRADITIONS.md

---

## BP-04: UI Package

**Objective:** Create packages/ui with foundational React components.
**Prerequisites:** BP-01
**Instruction:** Create @cosmos/ui with: Button (variants: primary/secondary/outline/ghost, loading state), Card (header/children/footer), Input (label, error, helperText, forwardRef), LoadingSpinner (SVG, sizes), ErrorDisplay (message, retry button).
**Expected Outputs:** packages/ui/src/components/
**Validation:** Types compile. Components export correctly.

---

## BP-05: Calculation Service

**Objective:** Create apps/calc Python FastAPI service with Swiss Ephemeris.
**Prerequisites:** BP-02
**Instruction:** Create FastAPI app with: Swiss Ephemeris wrapper, Julian Day conversion, planet position calculation, house calculation (6 systems), aspect calculation, longitude-to-sign conversion. POST /calculate/natal endpoint. Health endpoint. Pydantic models. Dockerfile. pytest test suite with reference chart validation.
**Expected Outputs:** apps/calc/ with app/ and tests/ directories.
**Validation:** `pytest tests/ -v` passes. POST /calculate/natal returns valid chart data.
**Docs Update:** CALCULATION.md, API.md

---

## BP-06: API Service Scaffold

**Objective:** Create apps/api Express + TypeScript scaffold with middleware.
**Prerequisites:** BP-02
**Instruction:** Express app with: Prisma schema (User, Profile, Chart, Synthesis), middleware (helmet, CORS, rate limiting, error handler, request ID, auth, validation), pino logger with PII redaction, encryption utils (AES-256-GCM), Redis client, config validation. Health endpoints.
**Expected Outputs:** apps/api/src/ with routes/, middleware/, lib/ directories. prisma/schema.prisma.
**Validation:** `pnpm typecheck` passes. Health endpoint responds.
**Docs Update:** API.md, ARCHITECTURE.md

---

## BP-07: Auth Implementation

**Objective:** JWT auth in apps/api.
**Prerequisites:** BP-06
**Instruction:** POST /auth/register (validate, hash password bcrypt 12 rounds, create user, return tokens). POST /auth/login (verify credentials, return tokens). POST /auth/refresh (validate refresh token, return new pair). Auth middleware (extract Bearer token, verify, attach userId). 15min access TTL, 7d refresh TTL.
**Expected Outputs:** apps/api/src/routes/auth.ts, middleware/auth.ts
**Validation:** Register → login → access protected route flow works. Invalid tokens rejected.

---

## BP-08: Profile CRUD

**Objective:** Encrypted profile management.
**Prerequisites:** BP-07
**Instruction:** CRUD routes for profiles (all require auth). Encrypt birth data with AES-256-GCM before storage. Decrypt on retrieval. Verify ownership on all operations. Validate with Zod schemas from @cosmos/types.
**Expected Outputs:** apps/api/src/routes/profiles.ts
**Validation:** Create profile → verify encrypted in DB → retrieve decrypted. Ownership enforced.

---

## BP-09: Chart Calculation Endpoint

**Objective:** API chart calculation with caching.
**Prerequisites:** BP-05, BP-08
**Instruction:** POST /charts/calculate: validate request, check Redis cache (key includes all calc params), proxy to calc service, cache result (24h TTL), store in DB, return chart data. GET /charts/:id: retrieve stored chart (verify ownership).
**Expected Outputs:** apps/api/src/routes/charts.ts
**Validation:** Calculate chart → verify cached → second request hits cache. Chart stored in DB.

---

## BP-10: Frontend Scaffold

**Objective:** Next.js 14 app with routing and auth.
**Prerequisites:** BP-07
**Instruction:** Next.js App Router with: root layout (dark mode, Tailwind), homepage, auth pages (login/register), dashboard, chart creation page with birth data form (react-hook-form + Zod), chart display page, Providers wrapper (TanStack Query), Zustand auth store, API client, Tailwind theme.
**Expected Outputs:** apps/web/ with app/, components/, lib/ directories.
**Validation:** `pnpm build` succeeds. Pages render. Forms validate.

---

## BP-11: Chart Rendering

**Objective:** D3.js SVG natal chart wheel.
**Prerequisites:** BP-10
**Instruction:** ChartWheel component: zodiac ring (12 signs with glyphs), house divisions, planet glyphs at correct positions, ASC/MC labels, retrograde indicators. PlanetTable: positions table with sign, degree, house, retrograde. Wire chart page to display both.
**Expected Outputs:** apps/web/components/ChartWheel.tsx, PlanetTable.tsx
**Validation:** Renders with mock data. Zodiac signs correctly positioned. Planets placed correctly.

---

## BP-12: AI Synthesis

**Objective:** BullMQ-based AI synthesis with Claude.
**Prerequisites:** BP-09, BP-11
**Instruction:** BullMQ queue setup in API. Synthesis worker calling Claude API with structured prompts. POST /synthesis/generate (returns jobId). GET /synthesis/status/:jobId. Result caching. Frontend synthesis panel with loading/polling. Fallback templates.
**Expected Outputs:** Synthesis routes, worker, prompts, frontend panel.
**Validation:** Generate synthesis → poll → complete → display. Fallback works.

---

## BP-13: Docker Compose Full Stack

**Objective:** Full local development environment.
**Prerequisites:** BP-09, BP-10
**Instruction:** Docker Compose with: PostgreSQL, Redis, calc service, API service, web service. Proper networking, health checks, volume mounts for development. Environment variables configured.
**Expected Outputs:** docker-compose.yml, per-service Dockerfiles.
**Validation:** `docker-compose up` starts all services. End-to-end flow works.

---

## BP-14: CI/CD Pipeline

**Objective:** GitHub Actions for automated quality gates.
**Prerequisites:** BP-05, BP-06, BP-10
**Instruction:** Workflows: lint + typecheck (Node.js), test (Node.js), test (Python), build. Run on PR to main. Fail on any error.
**Expected Outputs:** .github/workflows/ci.yml
**Validation:** Push branch → CI runs → all checks pass.

---

## BP-15: Integration Validation

**Objective:** End-to-end flow validation.
**Prerequisites:** All above
**Instruction:** Test the full flow: register user → create profile → calculate natal chart → view chart with SVG wheel → generate AI synthesis → view interpretation. Document results in BUILD_LOG.md.
**Expected Outputs:** Validated working system.
**Validation:** Full flow completes without errors. All data correct.
**Docs Update:** PROJECT_SUMMARY.md, BUILD_LOG.md, DEVELOPMENT_ROADMAP_v2.md
