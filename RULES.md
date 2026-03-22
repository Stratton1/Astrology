# COSMOS — Repository Operating Manual

## Project Mission

COSMOS: Open-source, multi-tradition astrology platform for accurate chart calculations, visualization, and AI-powered interpretation.

---

## Tech Stack

- **Frontend:** Next.js 14, React 18, TypeScript, Tailwind CSS, D3.js, Zustand, TanStack Query
- **API:** Express.js, TypeScript, Prisma, PostgreSQL, Redis, BullMQ
- **Calc:** Python 3.11+, FastAPI, Swiss Ephemeris (pyswisseph)
- **Monorepo:** Turborepo, pnpm
- **Testing:** Vitest, pytest, Playwright (future)
- **CI:** GitHub Actions

---

## Architectural Principles

- Service boundaries are strict: calc = math only, api = orchestration + storage + synthesis, web = presentation
- Shared contracts via packages/types are the source of truth
- All inter-service communication is typed and validated

---

## Coding Standards

- TypeScript strict mode
- ESLint + Prettier enforced
- Python: black + ruff
- No `any` types except in rare justified cases
- Meaningful variable names, no abbreviations

---

## Security Rules

- NEVER store birth data unencrypted at rest
- NEVER log PII (birth dates, locations, emails)
- ALWAYS validate input at API boundaries
- ALWAYS use parameterized queries (Prisma handles this)
- JWT tokens must expire (15min access, 7d refresh)

---

## Privacy Rules

- Birth data is encrypted with AES-256-GCM before storage
- Users can delete all their data
- No birth data in error reports or logs

---

## API Design Rules

- All routes prefixed `/api/v1/`
- Standard error envelope
- Zod validation on all inputs
- Rate limiting on all endpoints
- Correlation IDs on all requests

---

## Data Model Rules

- TypeScript interfaces and Prisma schema must stay in sync
- `packages/types` is the canonical source for shared types
- Never add a field to the DB without adding it to the type

---

## Testing Rules

- All calc functions must have reference validation tests
- All API routes must have integration tests
- Coverage targets: 80% calc, 70% API, 60% frontend
- Tests run in CI on every PR

---

## Documentation Rules

- Never merge work without updating relevant docs
- Never push without `BUILD_LOG.md` entry
- Always update `PROJECT_SUMMARY.md` when codebase materially changes
- Document architectural decisions in `/docs/DECISIONS.md`

---

## Logging/Observability Rules

- JSON structured logging (pino for Node, structlog for Python)
- Correlation IDs across service boundaries
- PII redaction in all log outputs
- Health check endpoints on all services

---

## Dependency Rules

- Justify new dependencies in commit messages
- Prefer well-maintained, small packages
- Pin versions in lockfile
- Audit quarterly

---

## Infrastructure/Deployment Rules

- Docker Compose for local dev
- Individual Dockerfiles per service
- Environment variables for all config (never hardcode)
- `.env.example` must stay current

---

## Change Management Rules

- Feature branches, PR-based workflow
- All PRs must pass CI
- Meaningful commit messages

---

## Prohibited Actions

- Never push directly to main
- Never skip CI checks
- Never commit `.env` files
- Never commit secrets or API keys
- Never bypass type checking with `as any`
- Never mix sidereal and tropical outputs without explicit labels

---

## Definition of Done

- Code compiles and passes typecheck
- Tests pass
- Linter clean
- Documentation updated
- `BUILD_LOG.md` entry added
- `PROJECT_SUMMARY.md` updated if material change
