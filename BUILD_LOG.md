# COSMOS — Build Log

> Append-only engineering diary. Each entry records what changed and why.

---

## Entry 001 — 2026-03-22

**Phase:** Phase 1 — Foundation
**Workstream:** Documentation & Project Setup

**Files Changed:**
- /docs/MASTER_BLUEPRINT_v2.md (created)
- /docs/DEVELOPMENT_ROADMAP_v2.md (created)
- /docs/DECISIONS.md (created)
- /docs/BUILD_PROMPTS_v2.md (created)
- /.claude/CLAUDE.md (created)
- /.claude/ARCHITECTURE.md (created)
- /.claude/TRADITIONS.md (created)
- /.claude/API.md (created)
- /.claude/FRONTEND.md (created)
- /.claude/CALCULATION.md (created)
- /.claude/EXECUTION_RULES.md (created)
- /RULES.md (created)
- /PROJECT_SUMMARY.md (created)
- /BUILD_LOG.md (created)
- /README.md (created)

**Summary:** Created complete v2 documentation foundation from COSMOS specification audit. All core architecture, roadmap, rules, and instruction files established.

**Reason:** Phase A-D of project bootstrap — docs-first, architecture-first approach before build begins.

**Tests Run:** N/A (documentation only)

**Docs Updated:** All foundation docs created.

**Known Follow-ups:**
- Create additional foundation files (SECURITY.md, TEST_STRATEGY.md, etc.)
- Begin monorepo scaffold
- Set up CI

**Risks Introduced:** None.
**Risks Mitigated:** Architectural ambiguity resolved through formal audit and decision documentation.

---

## Entry 002 — 2026-03-22
**Phase:** Phase 1 — Foundation
**Workstream:** Monorepo Scaffold + Service Foundations

**Files Changed (106 total):**
- Root: package.json, turbo.json, pnpm-workspace.yaml, tsconfig.base.json, .eslintrc.js, .prettierrc, .gitignore, docker-compose.yml, .env.example
- packages/types: 11 files (models, API types, Zod schemas)
- packages/traditions: 6 files (Western, Vedic, Hellenistic configs)
- packages/ui: 8 files (Button, Card, Input, LoadingSpinner, ErrorDisplay)
- apps/calc: 15 files (FastAPI, Swiss Ephemeris wrapper, natal endpoint, Pydantic models, tests, Dockerfile)
- apps/api: 17 files (Express, Prisma schema, auth, profiles, charts, middleware, encryption, logging, Dockerfile)
- apps/web: 16 files (Next.js 14, chart wheel D3.js, planet table, auth store, API client, Dockerfile)
- .github/workflows/ci.yml (CI pipeline)
- docs/: SECURITY.md, TEST_STRATEGY.md, DEPLOYMENT.md, ENVIRONMENT_VARIABLES.md, REPO_STRUCTURE.md, KNOWN_LIMITATIONS.md

**Summary:** Complete Phase 1 foundation build. All three services scaffolded with production-grade patterns: typed contracts, encrypted storage, structured logging, rate limiting, JWT auth, SVG chart rendering, Swiss Ephemeris integration.

**Reason:** Phase E execution — scaffold and start the real build after docs-first approach.

**Tests Run:** Structure validation (all 106 files confirmed present). Functional tests pending `pnpm install`.

**Docs Updated:** PROJECT_SUMMARY.md, BUILD_LOG.md

**Known Follow-ups:**
- Run `pnpm install` and validate full build pipeline
- Run pytest reference chart validation
- Wire end-to-end vertical slice
- Set up Prisma migrations

**Risks Introduced:** Dependencies not yet installed/resolved (pending pnpm install).
**Risks Mitigated:** All service boundaries established. Typed contracts in place. Encryption implemented. CI pipeline ready.

---

## Entry 003 — 2026-03-22
**Phase:** Phase 2 — Calculation Engine Validation
**Workstream:** Build Pipeline + Calc Service Validation

**Files Changed:**
- turbo.json (fix: `pipeline` → `tasks` for Turbo v2)
- packages/types/tsconfig.json (add `composite: true` for project references)
- apps/api/tsconfig.json (disable declarations for leaf app — fixes TS2742)
- apps/api/src/middleware/errorHandler.ts (fix requestId type cast)
- apps/api/src/routes/charts.ts (remove unused import)
- apps/web/components/PlanetTable.tsx (remove unused function)
- apps/calc/app/core/ephemeris.py (fix house cusp 0-indexing, remove unavailable ayanamsha constants, graceful Chiron skip)
- apps/calc/tests/test_ephemeris.py (fix planet count assertion, fix applying aspect test)

**Summary:** Full build pipeline validated. All TypeScript packages typecheck and build. All 48 Python calc tests pass. Swiss Ephemeris integration confirmed with reference chart validation (Sun position accurate to 0.03° at J2000.0).

**Reason:** Phase 2 execution — validate calculation engine accuracy and fix all compilation issues.

**Tests Run:**
- `pnpm typecheck` — 8/8 tasks pass
- `pnpm build` — 5/5 tasks pass (including Next.js production build)
- `pytest tests/ -v` — 48/48 pass
- Reference chart validation: J2000.0 Sun at 280.37° (expected ~280.4°, delta 0.03°)

**Docs Updated:** BUILD_LOG.md

**Known Follow-ups:**
- Install Chiron ephemeris data files (seas_18.se1) for full asteroid support
- Wire end-to-end vertical slice
- Set up Prisma migrations with live database

**Risks Introduced:** None.
**Risks Mitigated:** Build pipeline proven green. Calculation accuracy validated against known reference data.

---

## Entry 004 — 2026-03-22
**Phase:** Phase 3 — End-to-End Vertical Slice
**Workstream:** API + Calc Integration, Database, Full Flow

**Files Changed:**
- apps/api/prisma/schema.prisma (PostgreSQL → SQLite for dev, Json → String for SQLite compat)
- apps/api/src/routes/charts.ts (fix calc service URL /calculate/natal, flatten request body, JSON.stringify/parse calculatedData)
- apps/api/src/lib/redis.ts (graceful degradation when Redis unavailable, connection timeout, max retries)
- apps/calc/app/models/requests.py (remove unavailable ayanamsha constants)
- apps/api/.env (created for local development)

**Summary:** First end-to-end vertical slice working. Full flow validated: register user → create profile (encrypted birth data) → calculate natal chart (API → calc service → Swiss Ephemeris) → receive chart data with 11 planets, 12 houses, 14 aspects. Tested with Albert Einstein's birth data (1879-03-14, Ulm, Germany).

**Reason:** Phase 3 — wire all services together and prove the architecture works end-to-end.

**Tests Run:**
- curl POST /api/v1/auth/register → 201 (user created, JWT tokens returned)
- curl POST /api/v1/profiles → 201 (profile created with encrypted birth data)
- curl POST /api/v1/charts/calculate → 201 (chart calculated via calc service, stored in DB)
- Einstein chart: Sun Pisces 23.5°, Moon Sagittarius 14.9°, ASC Cancer 19.7°
- 48/48 pytest still passing

**Docs Updated:** BUILD_LOG.md, PROJECT_SUMMARY.md

**Known Follow-ups:**
- Switch back to PostgreSQL when Docker available (SQLite is dev-only stopgap)
- Add Redis for caching (works without it, just no cache)
- Frontend integration with the API
- Login flow + token refresh testing

**Risks Introduced:** SQLite dev database is not production-grade (no Json type, single-writer).
**Risks Mitigated:** Full architecture validated end-to-end. Service boundaries proven correct. Encryption/decryption working.

---

## Entry 005 — 2026-03-22
**Phase:** Phase 3 — Frontend Integration
**Workstream:** Frontend ↔ API wiring, auth flow, chart display

**Files Changed:**
- apps/web/lib/api.ts (fix default API URL: 8000 → 3001)
- apps/web/app/chart/page.tsx (add auth flow, profile creation, correct response shape, error display)
- apps/web/app/chart/[id]/page.tsx (rewrite as client component with auth, read from calculatedData, wire ChartWheel + PlanetTable)
- apps/api/src/lib/prisma.ts (new: Prisma client singleton)
- .env.example (fix JWT_ACCESS_TTL → JWT_ACCESS_EXPIRES_IN, add JWT_REFRESH_SECRET)

**Summary:** Frontend now properly authenticates, creates profiles, calculates charts via the API, and displays results with the D3.js chart wheel and planet table components. Fixed all response shape mismatches between API and frontend.

**Tests Run:** pnpm typecheck 8/8, pnpm build 5/5.

**Docs Updated:** BUILD_LOG.md

**Risks Introduced:** Demo auth flow auto-creates temp accounts (acceptable for dev, needs proper auth UI for production).
**Risks Mitigated:** Frontend ↔ API contract validated. All type errors resolved.

---

## Entry 006 — 2026-03-22
**Phase:** Phase 4 — Frontend Foundation
**Workstream:** Auth UI, Dashboard, Profile Management, Responsive Design, Testing

**Files Changed (20 total):**
- apps/web/app/layout.tsx (add shared Navbar, ThemeScript for dark mode persistence)
- apps/web/app/page.tsx (remove inline nav, use shared Navbar)
- apps/web/app/login/page.tsx (new: login page with react-hook-form + Zod validation)
- apps/web/app/register/page.tsx (new: registration page with password confirmation)
- apps/web/app/dashboard/page.tsx (new: profile list, chart count, quick actions, AuthGuard)
- apps/web/app/profile/[id]/page.tsx (new: profile detail view with birth data display)
- apps/web/app/profile/[id]/edit/page.tsx (new: profile edit form with Zod validation)
- apps/web/app/chart/page.tsx (refactor to use TanStack Query mutations + LocationAutocomplete)
- apps/web/app/chart/[id]/page.tsx (refactor to use useChart hook, responsive layout)
- apps/web/app/globals.css (add light mode overrides)
- apps/web/components/Navbar.tsx (new: shared sticky nav with auth state, active route, mobile nav)
- apps/web/components/DarkModeToggle.tsx (new: dark/light mode toggle with localStorage persistence)
- apps/web/components/ThemeScript.tsx (new: inline script to prevent theme flash on load)
- apps/web/components/AuthGuard.tsx (new: route protection with redirect to /login)
- apps/web/components/LocationAutocomplete.tsx (new: geocoding autocomplete via OpenCage API)
- apps/web/lib/hooks.ts (new: TanStack Query hooks for auth, profiles, charts)
- apps/web/vitest.config.ts (new: Vitest config with JSX, jsdom, path aliases)
- apps/web/vitest.setup.ts (new: testing-library/jest-dom matchers)
- apps/web/components/__tests__/PlanetTable.test.tsx (new: 7 tests)
- apps/web/components/__tests__/DarkModeToggle.test.tsx (new: 3 tests)
- apps/web/lib/__tests__/store.test.ts (new: 4 tests)
- apps/web/lib/__tests__/hooks.test.tsx (new: 4 tests)

**Summary:** Complete Phase 4 frontend foundation. Auth pages (login/register), dashboard with profile management (CRUD), geocoding autocomplete, dark mode toggle, shared navigation, responsive layout, TanStack Query integration across all pages, and 18 component/unit tests.

**Reason:** Phase 4 — build the full frontend user experience with proper auth UI, profile management, and data fetching patterns.

**Tests Run:**
- Vitest: 18/18 pass (PlanetTable, DarkModeToggle, store, query keys)
- Component tests: rendering, interaction, state management validated

**Docs Updated:** BUILD_LOG.md, PROJECT_SUMMARY.md

**Known Follow-ups:**
- Add OpenCage API key for geocoding autocomplete in production
- E2E tests with Playwright (Phase 7)
- AI synthesis UI (Phase 5)

**Risks Introduced:** None.
**Risks Mitigated:** Demo auth flow now supplemented with proper login/register UI. All pages use TanStack Query for consistent data fetching.

---

## Entry 007 — 2026-03-22
**Phase:** Phase 5 — AI Synthesis
**Workstream:** BullMQ Queue, Claude API Integration, Synthesis UI

**Files Changed (12 total):**
- apps/api/package.json (add bullmq, @anthropic-ai/sdk, worker scripts)
- apps/api/src/lib/queue.ts (new: BullMQ queue setup, job enqueue helper)
- apps/api/src/lib/prompts.ts (new: tradition-specific synthesis prompt templates for Western, Vedic, Hellenistic)
- apps/api/src/lib/config.ts (add anthropicApiKey, claudeModel, synthesisMaxTokens)
- apps/api/src/workers/synthesis.worker.ts (new: BullMQ worker with Claude API integration, retry logic, graceful shutdown)
- apps/api/src/routes/synthesis.ts (rewrite: BullMQ job enqueue, dedup pending jobs, cache completed syntheses)
- apps/api/src/__tests__/prompts.test.ts (new: 7 tests for prompt builder)
- apps/api/src/__tests__/queue.test.ts (new: 1 test for queue module interface)
- apps/web/lib/hooks.ts (add synthesis hooks: useGenerateSynthesis, useSynthesis, useSynthesesForChart)
- apps/web/lib/api.ts (fix synthesis endpoint path, export TokenResponse)
- apps/web/components/SynthesisPanel.tsx (new: synthesis trigger, polling, status display, markdown rendering)
- apps/web/components/__tests__/SynthesisPanel.test.tsx (new: 3 tests)
- apps/web/app/chart/[id]/page.tsx (integrate SynthesisPanel below chart details)
- apps/web/app/chart/page.tsx (fix unused variable, remove profileId from chart request)
- apps/api/.env (add ANTHROPIC_API_KEY, CLAUDE_MODEL, SYNTHESIS_MAX_TOKENS)
- .env.example (document CLAUDE_MODEL, SYNTHESIS_MAX_TOKENS)

**Summary:** Complete Phase 5 AI synthesis integration. BullMQ queue for async job processing, Claude API integration via @anthropic-ai/sdk with tradition-specific prompt templates (Western tropical, Vedic Jyotish, Hellenistic classical), synthesis status polling, result caching, and full synthesis UI with generate button, loading animation, markdown content display, and metadata footer.

**Reason:** Phase 5 — integrate AI-powered chart interpretation using Claude API with async job processing.

**Tests Run:**
- pnpm typecheck: 8/8 pass
- pnpm build: 5/5 pass
- API vitest: 8/8 pass (prompts: 7, queue: 1)
- Web vitest: 21/21 pass (SynthesisPanel: 3 + existing 18)
- pytest: 48/48 pass

**Docs Updated:** BUILD_LOG.md, PROJECT_SUMMARY.md

**Known Follow-ups:**
- Set ANTHROPIC_API_KEY env var to enable synthesis (required)
- Redis must be running for BullMQ queue (docker-compose up -d)
- Run worker process separately: pnpm --filter @cosmos/api worker:dev
- Multi-tradition expansion (Phase 6)
- E2E tests with Playwright (Phase 7)

**Risks Introduced:** AI synthesis latency (15-30s per request), Anthropic API cost per synthesis.
**Risks Mitigated:** Async queue prevents API blocking. Rate limiting on worker (10 jobs/min). Completed syntheses cached to avoid re-generation. Dedup logic prevents duplicate pending jobs.

---
