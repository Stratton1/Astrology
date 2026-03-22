# ============================================================================
# COSMOS — apps/web Next.js 14 Dockerfile
#
# Multi-stage build using Next.js standalone output.
# Build context: repository root (to include workspace packages).
#
# Usage (from repo root):
#   docker build -f apps/web/Dockerfile -t cosmos-web .
# ============================================================================

# ----------------------------------------------------------------------------
# Stage 1: base — shared Alpine + Node image with pnpm
# ----------------------------------------------------------------------------
FROM node:20-alpine AS base

RUN apk add --no-cache libc6-compat
RUN corepack enable && corepack prepare pnpm@latest --activate

# ----------------------------------------------------------------------------
# Stage 2: deps — install ALL workspace dependencies
# ----------------------------------------------------------------------------
FROM base AS deps

WORKDIR /repo

# Copy workspace manifests first for better layer caching
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY turbo.json ./

# Copy each package/app manifest
COPY apps/web/package.json ./apps/web/
COPY packages/types/package.json ./packages/types/
COPY packages/ui/package.json ./packages/ui/
COPY packages/traditions/package.json ./packages/traditions/

# Install all dependencies (including workspaces)
RUN pnpm install --frozen-lockfile

# ----------------------------------------------------------------------------
# Stage 3: builder — compile the Next.js app
# ----------------------------------------------------------------------------
FROM base AS builder

WORKDIR /repo

# Copy installed node_modules from deps stage
COPY --from=deps /repo/node_modules ./node_modules
COPY --from=deps /repo/apps/web/node_modules ./apps/web/node_modules 2>/dev/null || true

# Copy full source
COPY . .

# Build environment
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Build workspace packages that the web app depends on
RUN pnpm --filter @cosmos/types build 2>/dev/null || true
RUN pnpm --filter @cosmos/ui build 2>/dev/null || true
RUN pnpm --filter @cosmos/traditions build 2>/dev/null || true

# Build the Next.js app
RUN pnpm --filter @cosmos/web build

# ----------------------------------------------------------------------------
# Stage 4: runner — minimal production image
# ----------------------------------------------------------------------------
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Create non-root user for security
RUN addgroup --system --gid 1001 nodejs \
 && adduser --system --uid 1001 nextjs

# Copy standalone output (includes server.js and required node_modules)
COPY --from=builder --chown=nextjs:nodejs /repo/apps/web/.next/standalone ./

# Copy static assets
COPY --from=builder --chown=nextjs:nodejs /repo/apps/web/.next/static ./apps/web/.next/static

# Copy public directory (if it exists)
COPY --from=builder --chown=nextjs:nodejs /repo/apps/web/public ./apps/web/public

USER nextjs

EXPOSE 3000

# Next.js standalone server entrypoint
# The standalone output places server.js at the root of the standalone dir.
CMD ["node", "apps/web/server.js"]
