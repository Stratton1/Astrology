# COSMOS — Test Strategy

## Testing Pyramid
1. Unit Tests (most): individual functions, utils, calculations
2. Integration Tests: API routes with real DB, service communication
3. E2E Tests (least, future): full user flows via Playwright

## By Service

### apps/calc (Python)
- Framework: pytest
- Coverage target: 80%
- Key tests:
  - Planetary position accuracy (validate against published ephemeris, ≤1 arcminute)
  - House cusp accuracy
  - Aspect detection correctness
  - Sidereal offset application
  - Timezone conversion
  - Edge cases: Arctic circles, date line, historical dates, unknown birth time
- Reference charts: 5+ known celebrity charts with published positions

### apps/api (TypeScript)
- Framework: Vitest + supertest
- Coverage target: 70%
- Key tests:
  - Auth flow (register, login, refresh, protected routes)
  - Profile CRUD with encryption verification
  - Chart calculation proxy and caching
  - Validation rejection for malformed inputs
  - Rate limiting behavior
  - Error envelope format consistency

### apps/web (TypeScript)
- Framework: Vitest + React Testing Library
- Coverage target: 60%
- Key tests:
  - Form validation
  - Component rendering
  - Auth state management
  - Chart rendering with mock data
  - Loading/error states

### packages/types
- Framework: Vitest
- Tests: Zod schema validation (valid/invalid inputs)

### packages/traditions
- Framework: Vitest
- Tests: Configuration data integrity, all traditions have required fields

## CI Integration
- All tests run on PR via GitHub Actions
- Tests must pass before merge
- Coverage reports uploaded as artifacts

## Reference Validation Data
Maintain /apps/calc/tests/reference_charts/ with known chart data for validation.
