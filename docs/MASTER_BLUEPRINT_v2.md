# COSMOS — Master Blueprint v2

> Version: 2.0 | Created: 2026-03-22 | Status: Living Document

## 1. Product Vision

COSMOS is an open-source, multi-tradition astrology platform providing astronomically accurate chart calculations, interactive SVG visualizations, and AI-powered interpretive synthesis. It serves astrology practitioners, students, and developers across Western, Vedic (Jyotish), and Hellenistic traditions.

**Core principles:**
- Calculation accuracy above all else (Swiss Ephemeris, validated against published data)
- Multi-tradition native — not Western-first with bolt-ons
- Privacy by design — birth data encrypted at rest
- AI synthesis as enhancement, not dependency — charts work without AI

## 2. Scope Boundaries

### v1 (Launch)
- Natal chart calculation (Western tropical, Placidus default)
- Interactive SVG chart wheel rendering
- Planet positions, houses, aspects
- User registration and profile management
- Encrypted birth data storage
- AI-powered chart interpretation (Claude API)
- Basic transit overlay (point-in-time)
- Chart export (PNG/SVG)

### v1.1 (Post-Launch)
- Vedic/Jyotish tradition (sidereal, nakshatras, dashas)
- Hellenistic tradition (sect, bounds, lots)
- Multi-tradition comparison view
- Additional house systems

### v2 (Future)
- Synastry (relationship) charts
- Composite charts
- Solar return charts
- Secondary progressions
- Transit alerts

### Out of Scope
- Social features / community
- Marketplace for astrologers
- Real-time push notifications
- Native mobile apps (PWA later)
- Horary / electional astrology (specialized)

## 3. User Journeys

### Journey 1: Anonymous Quick Chart
1. User visits homepage → clicks "Create Chart"
2. Enters birth date, time (optional), location
3. Selects tradition (default: Western)
4. Receives calculated chart with SVG wheel and data tables
5. Can generate AI synthesis (limited for anonymous users)

### Journey 2: Registered User
1. Creates account → saves birth profile
2. Calculates natal chart → saved to account
3. Generates AI synthesis → cached for future visits
4. Returns later → charts and profiles preserved
5. Creates additional profiles (family, friends)

### Journey 3: Tradition Comparison
1. User creates a profile with birth data
2. Calculates Western tropical chart
3. Switches to Vedic/sidereal → sees same birth data in different coordinate system
4. Compares planet positions side-by-side
5. Reads tradition-specific synthesis for each

### Journey 4: Chart Export
1. User views calculated chart
2. Clicks export → selects SVG or PNG
3. Downloads chart image with metadata

## 4. Supported Traditions

### Feature Matrix

| Feature | Western | Vedic | Hellenistic |
|---------|---------|-------|-------------|
| Coordinate system | Tropical | Sidereal | Tropical |
| Default house system | Placidus | Whole Sign | Whole Sign |
| Planets (Sun–Saturn) | ✅ | ✅ | ✅ |
| Outer planets (Uranus–Pluto) | ✅ | ⚠️ Optional | ❌ |
| Lunar nodes | ✅ Mean | ✅ Rahu/Ketu | ✅ |
| Chiron | ✅ | ❌ | ❌ |
| Nakshatras | ❌ | ✅ | ❌ |
| Dashas | ❌ | ✅ Vimshottari | ❌ |
| Yogas | ❌ | ✅ | ❌ |
| Sect | ❌ | ❌ | ✅ |
| Bounds/Terms | ❌ | ❌ | ✅ |
| Lots (Fortune, etc.) | ❌ | ❌ | ✅ |
| Profections | ❌ | ❌ | ✅ |
| Dignities (essential) | ✅ | ✅ | ✅ |
| Aspects (Ptolemaic) | ✅ | ✅ | ✅ |
| Minor aspects | ✅ | ❌ | ❌ |

## 5. High-Level Architecture

```
┌─────────────┐     ┌──────────────┐     ┌──────────────┐
│   Browser    │────▶│   apps/web   │────▶│   apps/api   │
│              │◀────│  Next.js 14  │◀────│   Express    │
└─────────────┘     └──────────────┘     └──────┬───────┘
                                                 │
                          ┌──────────────────────┼───────────────┐
                          │                      │               │
                    ┌─────▼──────┐    ┌─────────▼──┐   ┌───────▼───────┐
                    │ PostgreSQL │    │   Redis     │   │  apps/calc    │
                    │  (Prisma)  │    │  (Cache +   │   │  FastAPI +    │
                    │            │    │   BullMQ)   │   │  Swiss Ephem  │
                    └────────────┘    └────────────┘   └───────────────┘
```

### Service Responsibilities

| Service | Does | Does NOT |
|---------|------|----------|
| apps/web | SSR/CSR, routing, forms, SVG rendering, auth UI | Direct DB access, calculations, AI calls |
| apps/api | Auth, validation, encryption, caching, synthesis, DB ops | Astronomical math, SVG rendering |
| apps/calc | Planetary positions, houses, aspects, ephemeris queries | Auth, storage, caching, AI synthesis |
| packages/types | Shared TypeScript interfaces, Zod schemas | Business logic, runtime code |
| packages/ui | Shared React components | App-specific logic |
| packages/traditions | Tradition configs, dignities, rulerships, orbs | Calculations, rendering |

## 6. Request Flow

```
1. User submits birth data form
2. Next.js validates client-side (Zod)
3. POST /api/v1/charts/calculate
4. API validates request (Zod from packages/types)
5. API checks Redis cache (cache key includes all calc params)
6. Cache MISS → API calls calc service POST /calculate/natal
7. Calc service computes via Swiss Ephemeris
8. Calc returns planet positions, houses, aspects
9. API caches result in Redis (TTL 24h)
10. API stores chart in PostgreSQL
11. API returns chart data to frontend
12. Frontend renders SVG wheel + data tables
```

## 7. Data Flow

```
Birth Data Input → Zod Validation → AES-256-GCM Encryption → PostgreSQL (encrypted)
                                   ↓ (decrypted for calc)
                             Calc Service → Swiss Ephemeris → Planet Positions
                                   ↓
                             Redis Cache ← Chart Data → PostgreSQL (JSON)
                                   ↓
                             Frontend Rendering (SVG + Tables)
```

## 8. Security Model

- **Encryption at rest:** AES-256-GCM field-level encryption for birth data
- **Transport:** HTTPS required in production
- **Authentication:** JWT (15min access, 7d refresh, httpOnly cookies)
- **Authorization:** Users access only their own data
- **Validation:** Zod schemas at API boundary
- **Rate limiting:** express-rate-limit + Redis store
- **Logging:** PII redacted (pino redaction paths)
- **Headers:** Helmet (CSP, HSTS, X-Frame-Options)
- **Dependencies:** Regular audit via pnpm audit / pip audit

## 9. Data Model

```
User
  id: UUID (PK)
  email: string (unique, indexed)
  password: string (bcrypt hash)
  createdAt: timestamp
  updatedAt: timestamp
  → has many Profiles

Profile
  id: UUID (PK)
  userId: UUID (FK → User)
  name: string
  encryptedBirthData: string (AES-256-GCM)
  locationName: string (display only, not sensitive)
  createdAt: timestamp
  updatedAt: timestamp
  → has many Charts

Chart
  id: UUID (PK)
  profileId: UUID (FK → Profile)
  tradition: enum (western, vedic, hellenistic)
  chartType: enum (natal, transit, synastry, composite, solar_return)
  coordinateSystem: enum (tropical, sidereal)
  houseSystem: enum (placidus, whole_sign, equal, koch, campanus, regiomontanus)
  ayanamsha: string? (lahiri, raman, etc.)
  calculatedData: JSON (full calculation result)
  createdAt: timestamp
  → has many Syntheses

Synthesis
  id: UUID (PK)
  chartId: UUID (FK → Chart)
  tradition: enum
  status: enum (pending, processing, completed, failed)
  content: text? (AI-generated interpretation)
  model: string? (claude model used)
  tokensUsed: int?
  error: string?
  createdAt: timestamp
  completedAt: timestamp?
```

## 10. Caching Model

| Layer | Store | TTL | Key Pattern | Purpose |
|-------|-------|-----|-------------|---------|
| L1 | In-memory LRU | 5min | — | Hot chart data in API process |
| L2 | Redis | 24h | `calc:{tradition}:{type}:{coord}:{house}:{ayanamsha}:{dataHash}` | Calculation results |
| L2 | Redis | 7d | `synth:{chartId}:{promptVer}:{model}` | AI synthesis results |
| L2 | Redis | 30d | `geo:{query}` | Geocoding results |

## 11. AI Synthesis Architecture

- **Location:** apps/api (NOT calc)
- **Queue:** BullMQ with Redis backend
- **Flow:** POST /synthesis/generate → enqueue job → worker calls Claude API → store result → mark complete
- **Templates:** Structured prompts per tradition (Western, Vedic, Hellenistic)
- **Output:** JSON with structured sections (overview, planets, houses, aspects, summary)
- **Fallback:** Pre-written template text if AI call fails
- **Cache:** Results cached by chartId + prompt version + model
- **Safety:** No medical/legal/financial claims. Tradition-appropriate language. Disclaimers included.

## 12. Deployment Architecture

- **Local dev:** Docker Compose (PostgreSQL, Redis) + pnpm dev
- **Production target:** Railway / Fly.io / self-hosted Docker
- **Containers:** Individual Dockerfiles per service
- **Database:** Managed PostgreSQL (or Docker)
- **Cache/Queue:** Managed Redis (or Docker)
- **Config:** Environment variables only, validated at startup

## 13. Observability Strategy

- **Logging:** Structured JSON (pino for Node.js, structlog for Python)
- **Correlation:** X-Request-ID header propagated across services
- **Health:** GET /health (alive), GET /ready (dependencies OK)
- **Errors:** Sentry with PII scrubbing (redact birth data, emails, tokens)
- **Metrics:** Request count, latency (p50/p95/p99), cache hit ratio, synthesis queue depth

## 14. Testing Strategy

- **Unit:** Vitest (TypeScript), pytest (Python)
- **Integration:** supertest for API routes with test database
- **Calculation validation:** Known reference charts compared against published ephemeris
- **E2E:** Playwright (deferred to Phase 7)
- **Coverage targets:** 80% calc, 70% API, 60% frontend

## 15. Known Limitations

1. Swiss Ephemeris accuracy degrades for dates before ~1500 AD
2. House calculations fail for extreme latitudes (>66.5°) with Placidus
3. Geocoding accuracy for historical/small locations may be poor
4. AI synthesis is non-deterministic — same chart may produce different interpretations
5. Birth time unknown charts have unreliable house placements
6. Julian/Gregorian calendar boundary (Oct 1582) requires careful handling
7. No real-time transit tracking in v1
8. Asteroid positions limited to Chiron; others deferred
9. Fixed star positions not included in v1
10. Rate limits may restrict heavy usage

## 16. Release Sequencing

| Phase | Objective | Key Deliverables |
|-------|-----------|-----------------|
| 1 | Foundation | Monorepo, types, CI, docs |
| 2 | Calculation Engine | Swiss Ephemeris integration, natal charts |
| 3 | API Layer | Auth, profiles, chart endpoints, storage |
| 4 | Frontend | Chart rendering, forms, profile management |
| 5 | AI Synthesis | BullMQ, prompts, Claude integration |
| 6 | Multi-Tradition | Vedic, Hellenistic, sidereal support |
| 7 | Hardening | E2E tests, security audit, performance, launch prep |
