# COSMOS — Claude Code Instructions

## Project Overview
COSMOS is a multi-tradition astrology platform with accurate chart calculations, SVG visualizations, and AI-powered synthesis.

## Repository Structure
```
apps/web        → Next.js 14 frontend
apps/api        → Express API gateway
apps/calc       → Python FastAPI calc service (Swiss Ephemeris)
packages/types  → Shared TypeScript types + Zod schemas
packages/ui     → Shared React components
packages/traditions → Tradition-specific config data
```

## Tech Stack
- **Frontend:** Next.js 14, React 18, TypeScript, Tailwind CSS, D3.js, Zustand, TanStack Query
- **API:** Express.js, TypeScript, Prisma, PostgreSQL, Redis, BullMQ
- **Calc:** Python 3.11+, FastAPI, Swiss Ephemeris (pyswisseph)
- **Monorepo:** Turborepo, pnpm
- **Testing:** Vitest, pytest

## Commands
```bash
pnpm install          # Install all dependencies
pnpm dev              # Start all services in dev mode
pnpm build            # Build all packages/apps
pnpm test             # Run all tests
pnpm lint             # Lint all packages
pnpm typecheck        # Type-check all packages
docker-compose up -d  # Start PostgreSQL + Redis
```

## Critical Rules
1. **Never store birth data unencrypted** — AES-256-GCM encryption before Prisma persistence
2. **Never mix coordinate systems** — every output must label `coordinateSystem` and `ayanamsha`
3. **Calc service is pure math** — no AI, no storage, no auth. Just Swiss Ephemeris calculations
4. **API handles orchestration** — auth, encryption, caching, synthesis, storage
5. **packages/types is source of truth** — all shared contracts defined here
6. **Always update BUILD_LOG.md** after material changes
7. **Always update PROJECT_SUMMARY.md** when codebase state changes
8. **Validate calculation changes** against known reference charts

## Related Files
- `/.claude/ARCHITECTURE.md` — Service architecture details
- `/.claude/TRADITIONS.md` — Astrology tradition rules
- `/.claude/API.md` — API design and routes
- `/.claude/FRONTEND.md` — Frontend architecture
- `/.claude/CALCULATION.md` — Calculation engine details
- `/.claude/EXECUTION_RULES.md` — Work discipline rules
- `/RULES.md` — Repository operating manual
- `/docs/DECISIONS.md` — Architectural decision records
