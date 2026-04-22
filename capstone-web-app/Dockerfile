# ── Stage 1: install all dependencies ────────────────────────────────────────
FROM node:20-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm ci

# ── Stage 2: build ────────────────────────────────────────────────────────────
FROM node:20-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY package.json          ./
COPY src/                  ./src/
COPY next.config.ts        ./
COPY tsconfig.json         ./
COPY tailwind.config.ts    ./
COPY postcss.config.mjs    ./
# CSV files are required here so Next.js can pre-render the static pages at build time.
# The actual live data is supplied via the volume mount at runtime (see below).
COPY Reports/runs.csv \
     Reports/epochs.csv \
     Reports/test_reports.csv \
     Reports/

RUN npm run build

# ── Stage 3: minimal production image ─────────────────────────────────────────
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

# standalone output bundles its own trimmed node_modules — no npm install needed
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static     ./.next/static

# Create an empty Reports/ dir as the mount target.
# Override at runtime with:
#   docker run -v /abs/path/to/Reports:/app/Reports ...
RUN mkdir -p Reports

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=10s --start-period=20s --retries=3 \
  CMD wget -qO- http://localhost:3000/ || exit 1

CMD ["node", "server.js"]
