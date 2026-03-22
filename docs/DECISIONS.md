# COSMOS — Audit Report & Decision Log

> Created: 2026-03-22 | Status: Living Document

## Audit Summary

This document records the formal audit of the COSMOS specification and all architectural decisions. The audit was performed against the COSMOS specification covering product vision, architecture, data models, calculation engine, frontend, API, infrastructure, AI synthesis, and execution strategy.

---

## Critical Issues

### AUD-001: Birth Data Encryption Not Specified
- **Affected Areas:** apps/api, Prisma schema, Profile model
- **Why It Matters:** Birth data (dates, times, locations) is sensitive PII. Storing it in plaintext violates privacy-by-design principles and creates legal/regulatory risk.
- **Risk If Unresolved:** Data breach exposes highly personal information. Potential GDPR/CCPA violations.
- **Recommended Fix:** Field-level AES-256-GCM encryption in the API layer before Prisma persistence.
- **Decision Taken:** ✅ Implemented. Birth data encrypted before storage, decrypted on retrieval. Encryption key via `ENCRYPTION_KEY` env var.

### AUD-002: AI Synthesis Service Placement Ambiguous
- **Affected Areas:** apps/api, apps/calc, service boundaries
- **Why It Matters:** If synthesis lives in the calc service, it pollutes pure mathematical computation with AI API calls, making the calc service non-deterministic and harder to test.
- **Recommended Fix:** Synthesis service belongs in apps/api, keeping apps/calc as pure deterministic math.
- **Decision Taken:** ✅ Synthesis lives in apps/api with structured prompt templates and BullMQ for async processing.

### AUD-003: Sidereal/Tropical Mixing Risk
- **Affected Areas:** apps/calc, packages/types, apps/web
- **Why It Matters:** Sidereal and tropical coordinates differ by ~24° (current ayanamsha). Mixing them without labels produces incorrect interpretations.
- **Risk If Unresolved:** Users receive incorrect chart data. Fundamental correctness failure.
- **Decision Taken:** ✅ Every calculation response includes `coordinateSystem: 'tropical' | 'sidereal'` and `ayanamsha?: string` fields. Frontend displays these prominently.

### AUD-004: No Background Job Architecture for Synthesis
- **Affected Areas:** apps/api, AI synthesis
- **Why It Matters:** Claude API calls can take 10-30 seconds. Synchronous handling blocks API threads and causes timeouts.
- **Recommended Fix:** BullMQ with Redis for async synthesis jobs. WebSocket or polling for status.
- **Decision Taken:** ✅ BullMQ queue in apps/api. POST /synthesis/generate returns jobId immediately. GET /synthesis/status/:jobId for polling.

### AUD-005: Cache Identity Unclear
- **Affected Areas:** apps/api, Redis caching
- **Why It Matters:** If cache keys don't encode all calculation-affecting parameters, users may receive incorrect cached results (e.g., tropical result for a sidereal request).
- **Decision Taken:** ✅ Cache key format: `calc:{tradition}:{chartType}:{coordSystem}:{houseSystem}:{ayanamsha}:{hash(birthData)}`

---

## High Priority Issues

### AUD-006: No API Versioning Strategy
- **Affected Areas:** apps/api, apps/web
- **Decision Taken:** URL prefix `/api/v1/` from day one. Breaking changes get `/api/v2/`.

### AUD-007: No Rate Limiting Design
- **Affected Areas:** apps/api
- **Decision Taken:** express-rate-limit with Redis store. 100 req/min anonymous, 300 authenticated, 10 synthesis.

### AUD-008: No Error Contract Standard
- **Affected Areas:** apps/api, apps/web
- **Decision Taken:** Standardized envelope: `{ error: { code: string, message: string, details?: unknown, requestId: string } }`

### AUD-009: Timezone Handling for Historical Dates
- **Affected Areas:** apps/calc, packages/types
- **Decision Taken:** Store all times as UTC with original IANA timezone ID and UTC offset. Use pytz for historical timezone resolution.

### AUD-010: House System Selection Not Parameterized
- **Affected Areas:** apps/calc, packages/types
- **Decision Taken:** Support Placidus (default), Whole Sign, Equal, Koch, Campanus, Regiomontanus as enum. Parameterized in calculation request.

---

## Medium Priority Issues

### AUD-011: No Health Check Endpoints
- **Decision Taken:** `/health` and `/ready` on all services. `/ready` checks downstream dependencies.

### AUD-012: No Structured Logging Standard
- **Decision Taken:** pino (Node.js), structlog (Python), JSON format, correlation IDs via X-Request-ID.

### AUD-013: SVG Chart Rendering Complexity
- **Decision Taken:** Start with basic D3.js SVG wheel. Iterate. Zodiac ring → houses → planets → aspects as layers.

### AUD-014: No Idempotency Strategy
- **Decision Taken:** X-Idempotency-Key header for POST /charts/calculate. Deduplication via Redis.

### AUD-015: No Geocoding Service Specified
- **Decision Taken:** OpenCage Geocoder (affordable, good global coverage) with Redis caching (30d TTL).

---

## Low Priority Improvements

| ID | Title | Status |
|----|-------|--------|
| AUD-016 | No bundle size budget for frontend | Deferred to Phase 7 |
| AUD-017 | No accessibility audit plan | Deferred to Phase 7 |
| AUD-018 | No i18n strategy | Deferred to post-launch |
| AUD-019 | No data export/portability plan | Deferred to post-launch |
| AUD-020 | No OpenAPI documentation generation | Deferred to Phase 7 |

---

## Decision Log

### DEC-001: Synthesis Service in API Layer
| Field | Value |
|-------|-------|
| ID | DEC-001 |
| Date | 2026-03-22 |
| Title | AI synthesis belongs in API layer |
| Context | Synthesis requires AI API calls, caching, and job queuing — none of which belong in a pure calculation engine |
| Options | (A) Synthesis in calc service (B) Synthesis in API layer (C) Separate synthesis microservice |
| Decision | (B) Synthesis in API layer |
| Rationale | Keeps calc service pure and deterministic. Avoids premature microservice split. API already has Redis/DB access. |
| Consequences | API service is larger. Synthesis scales with API. |
| Status | Accepted |

### DEC-002: AES-256-GCM for Birth Data
| Field | Value |
|-------|-------|
| ID | DEC-002 |
| Date | 2026-03-22 |
| Title | Field-level encryption for birth data |
| Context | Birth data is sensitive PII requiring encryption at rest |
| Options | (A) Database-level encryption (B) Field-level AES-256-GCM (C) No encryption |
| Decision | (B) Field-level AES-256-GCM |
| Rationale | Protects data even if database is compromised. Application controls decryption. Key rotation possible. |
| Consequences | Slightly more complex Profile CRUD. Cannot query on encrypted fields. |
| Status | Accepted |

### DEC-003: BullMQ for Async Synthesis
| Field | Value |
|-------|-------|
| ID | DEC-003 |
| Date | 2026-03-22 |
| Title | BullMQ queue for AI synthesis jobs |
| Context | AI synthesis takes 10-30s, cannot be synchronous |
| Options | (A) Synchronous with long timeout (B) BullMQ queue (C) External queue service |
| Decision | (B) BullMQ queue |
| Rationale | Redis-backed, Node.js native, good DX, handles retries/backoff. Already have Redis. |
| Consequences | Requires polling or WebSocket for status. Adds job queue complexity. |
| Status | Accepted |

### DEC-004: Express over Fastify for API
| Field | Value |
|-------|-------|
| ID | DEC-004 |
| Date | 2026-03-22 |
| Title | Express.js as API framework |
| Context | Need a Node.js HTTP framework for the API gateway |
| Options | (A) Express (B) Fastify (C) Hono |
| Decision | (A) Express |
| Rationale | Largest ecosystem, most middleware, team familiarity, Prisma integration mature. Performance adequate for our scale. |
| Consequences | Slightly lower raw performance than Fastify. Mitigated by caching. |
| Status | Accepted |

### DEC-005: FastAPI for Calculation Service
| Field | Value |
|-------|-------|
| ID | DEC-005 |
| Date | 2026-03-22 |
| Title | FastAPI for Python calc service |
| Context | Swiss Ephemeris has best Python bindings. Need a Python HTTP framework. |
| Options | (A) FastAPI (B) Flask (C) Django REST |
| Decision | (A) FastAPI |
| Rationale | Async support, auto OpenAPI docs, Pydantic validation, excellent performance for Python. |
| Consequences | Team needs Python + TypeScript. Two runtimes in the stack. |
| Status | Accepted |
