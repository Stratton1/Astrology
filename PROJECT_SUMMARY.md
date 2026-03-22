# COSMOS — Project Summary

## Purpose

Multi-tradition astrology platform providing accurate chart calculations, interactive SVG visualizations, and AI-powered interpretive synthesis across Western, Vedic, and Hellenistic traditions.

---

## Current Architecture

Turborepo monorepo with three services (web, api, calc) and three shared packages (types, ui, traditions).

---

## Current Build Status

Phase 5: AI Synthesis — Complete

---

## Completed Modules

- Project documentation foundation (v2 docs, RULES.md, control files)
- Repository scaffold (Turborepo, pnpm workspace, tsconfig, ESLint, Prettier)
- Shared types and Zod schemas (packages/types — 11 files)
- Tradition configurations (packages/traditions — Western, Vedic, Hellenistic)
- UI component library scaffold (packages/ui — Button, Card, Input, LoadingSpinner, ErrorDisplay)
- Python calc service foundation (apps/calc — FastAPI, Swiss Ephemeris wrapper, natal endpoint, tests)
- API gateway foundation (apps/api — Express, Prisma, auth, profiles, charts, encryption, caching)
- Frontend foundation (apps/web — Next.js 14, chart wheel, planet table, auth store, API client)
- CI pipeline (GitHub Actions — lint, typecheck, test, build)
- Docker Compose (PostgreSQL, Redis)
- Dockerfiles for all three services
- End-to-end vertical slice (register → profile → chart calculation working)
- SQLite local development database with Prisma
- Redis graceful degradation (works without Redis)
- Auth UI: login and register pages with Zod validation
- Dashboard with profile list, chart counts, quick actions
- Profile management: view, edit, delete with AuthGuard protection
- Geocoding autocomplete (LocationAutocomplete component, OpenCage API)
- Dark mode toggle with localStorage persistence and flash-prevention script
- Shared Navbar with auth state, active route highlighting, mobile responsive nav
- TanStack Query hooks for all API operations (auth, profiles, charts)
- Frontend component tests (Vitest + React Testing Library — 18 tests)
- BullMQ async synthesis queue (Redis-backed, 3 retries, exponential backoff)
- Claude API integration via @anthropic-ai/sdk (synthesis worker process)
- Tradition-specific synthesis prompts (Western tropical, Vedic Jyotish, Hellenistic classical)
- Synthesis API routes with dedup, caching, and status polling
- Synthesis UI: generate button, loading animation, markdown rendering, status badges
- TanStack Query synthesis hooks with 3s polling for in-progress jobs
- API synthesis tests (8 tests: prompts + queue)
- Frontend synthesis tests (3 tests: SynthesisPanel)

---

## In-Progress Modules

None currently.

---

## Blocked Items

None currently.

---

## Key Decisions

- AI synthesis lives in API layer, not calc (DEC-001)
- Field-level encryption for birth data (DEC-002)
- BullMQ for async synthesis jobs (DEC-003)
- Express over Fastify for API (ecosystem maturity)
- FastAPI for calc service (Python async, auto-docs)
- TanStack Query for all server state (consistent caching, refetching)

---

## Current Environment/Deployment Status

Local development only. No staging or production deployed.

---

## Current Test Status

All quality gates pass: pnpm typecheck 8/8, pnpm build 5/5, pytest 48/48, API vitest 8/8, web vitest 21/21. End-to-end flow validated via curl.

---

## Immediate Next Priorities

1. Multi-tradition expansion (Phase 6) — Vedic sidereal, Hellenistic features
2. Switch to PostgreSQL when Docker is available
3. Add Redis for production caching
4. E2E tests with Playwright (Phase 7)

---

## Known Risks

- Swiss Ephemeris compilation across platforms
- AI synthesis latency and cost
- OpenCage API key needed for geocoding autocomplete in production

---

## Last Updated

2026-03-22

---

## Latest Change Summary

Phase 5 complete: AI synthesis integration with BullMQ async queue, Claude API via @anthropic-ai/sdk, tradition-specific prompt templates (Western/Vedic/Hellenistic), synthesis UI with polling and markdown rendering, 29 total tests across API and web.
