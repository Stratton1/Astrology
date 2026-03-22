# COSMOS — Environment Variables

## Root / Shared
| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| NODE_ENV | Yes | development | Environment mode |

## apps/api
| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| PORT | No | 3001 | API server port |
| DATABASE_URL | Yes | — | PostgreSQL connection string |
| REDIS_URL | Yes | — | Redis connection string |
| JWT_SECRET | Yes | — | JWT signing secret (min 256-bit) |
| JWT_ACCESS_TTL | No | 15m | Access token TTL |
| JWT_REFRESH_TTL | No | 7d | Refresh token TTL |
| ENCRYPTION_KEY | Yes | — | AES-256-GCM key for birth data (hex, 64 chars) |
| CALC_SERVICE_URL | No | http://localhost:3002 | Calc service base URL |
| ANTHROPIC_API_KEY | Yes* | — | Claude API key (*required for synthesis) |
| OPENCAGE_API_KEY | Yes* | — | OpenCage geocoding key (*required for geocoding) |
| LOG_LEVEL | No | info | Logging level |
| RATE_LIMIT_WINDOW | No | 60000 | Rate limit window in ms |
| RATE_LIMIT_MAX | No | 100 | Max requests per window |
| SENTRY_DSN | No | — | Sentry error tracking DSN |

## apps/calc
| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| PORT | No | 3002 | Calc service port |
| EPHE_PATH | No | /usr/share/swisseph | Swiss Ephemeris data files path |
| LOG_LEVEL | No | info | Logging level |

## apps/web
| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| NEXT_PUBLIC_API_URL | Yes | http://localhost:3001 | API base URL |
| NEXT_PUBLIC_OPENCAGE_API_KEY | No | — | Client-side geocoding (if needed) |
