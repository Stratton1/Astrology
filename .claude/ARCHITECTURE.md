# COSMOS — Architecture Reference

## Service Boundaries

```
Browser → apps/web (Next.js SSR/CSR) → apps/api (Express) → apps/calc (FastAPI)
                                              ↓
                                    PostgreSQL + Redis + BullMQ
```

### apps/web (Frontend)
**Does:** SSR/CSR, routing, forms, SVG chart rendering, auth UI, state management
**Does NOT:** Direct DB access, calculations, AI calls, data encryption

### apps/api (API Gateway)
**Does:** Auth (JWT), validation (Zod), encryption (AES-256-GCM), caching (Redis), synthesis (BullMQ + Claude), storage (Prisma/PostgreSQL), rate limiting, logging
**Does NOT:** Astronomical calculations, SVG rendering

### apps/calc (Calculation Engine)
**Does:** Planetary positions, house cusps, aspects, Julian Day conversion, coordinate system conversion
**Does NOT:** Auth, storage, caching, AI synthesis, encryption

## Request Flow
1. Client → Next.js → POST /api/v1/charts/calculate
2. API validates (Zod), checks Redis cache
3. Cache miss → API calls calc service POST /calculate/natal
4. Calc computes via Swiss Ephemeris, returns positions
5. API caches result (Redis, 24h TTL), stores in PostgreSQL
6. Returns chart data to frontend → renders SVG + tables

## Data Model (PostgreSQL via Prisma)
- **User** → has many Profiles
- **Profile** (encrypted birth data) → has many Charts
- **Chart** (calculated data as JSON) → has many Syntheses
- **Synthesis** (AI-generated interpretation)

## Caching (Redis)
- Calculation results: `calc:{tradition}:{type}:{coord}:{house}:{ayanamsha}:{hash}` — 24h TTL
- Synthesis results: `synth:{chartId}:{promptVer}:{model}` — 7d TTL
- Geocoding: `geo:{query}` — 30d TTL

## Queue (BullMQ + Redis)
- Synthesis jobs: async AI interpretation generation
- Flow: enqueue → worker processes → stores result → marks complete
- Client polls GET /synthesis/status/:jobId

## Shared Packages
- **@cosmos/types** — TypeScript interfaces + Zod schemas (source of truth)
- **@cosmos/ui** — React components (Button, Card, Input, etc.)
- **@cosmos/traditions** — Tradition configs (dignities, rulerships, orbs)
