# COSMOS — Deployment Guide

## Environments
| Environment | Purpose | Infrastructure |
|-------------|---------|---------------|
| Local | Development | Docker Compose |
| Staging | Pre-production testing | TBD (Railway/Fly.io) |
| Production | Live service | TBD (Railway/Fly.io) |

## Local Development
```bash
# Start infrastructure
docker-compose up -d  # PostgreSQL, Redis

# Install dependencies
pnpm install

# Run database migrations
cd apps/api && pnpm prisma migrate dev

# Start all services
pnpm dev  # runs all services via Turborepo
```

Services run at:
- Web: http://localhost:3000
- API: http://localhost:3001
- Calc: http://localhost:3002

## Docker
Each service has its own Dockerfile:
- apps/web/Dockerfile
- apps/api/Dockerfile
- apps/calc/Dockerfile

Build: `docker-compose -f docker-compose.prod.yml build`

## Database
- PostgreSQL 15+
- Migrations managed by Prisma
- Run migrations: `pnpm prisma migrate deploy` (production)

## Required Services
- PostgreSQL 15+
- Redis 7+

## Health Checks
- API: GET /health, GET /ready
- Calc: GET /health
- Web: Next.js built-in

## Startup Order
1. PostgreSQL
2. Redis
3. Calc service
4. API service (depends on PostgreSQL, Redis, Calc)
5. Web (depends on API)
