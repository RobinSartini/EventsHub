# Production image for the EventsHub docs (Fumadocs on React Router, SSR).
# Build from the repository root so workspace packages resolve:
#   docker build -f apps/fumadocs/Dockerfile .

FROM oven/bun:1.3.14 AS base
WORKDIR /app

FROM base AS builder
# react-router build must run on real Node: under the bun shim, react-dom/server lacks renderToPipeableStream.
COPY --from=node:24-slim /usr/local/bin/node /usr/local/bin/node
# The install runs prisma generate (packages/db postinstall), and prisma.config.ts reads DATABASE_URL.
# Generating the client does not connect to the database, so a placeholder is enough.
ARG DATABASE_URL="postgresql://build:build@localhost:5432/build"
COPY . .
# Git hook setup needs git, which the image does not have.
RUN bun pm pkg delete scripts.prepare
RUN if [ -f bun.lock ]; then bun install --frozen-lockfile; else bun install; fi
RUN bun run --filter fumadocs build

# Production dependencies of the docs workspace, without dev dependencies.
FROM base AS deps
COPY . .
# Drop install scripts of the workspaces themselves (Git hook setup, prisma generate):
# they need dev tools this stage leaves out. Dependencies keep theirs.
RUN bun -e 'const fs = require("fs"); \
  const dirs = ["apps", "packages"].filter((root) => fs.existsSync(root)) \
    .flatMap((root) => fs.readdirSync(root).map((name) => root + "/" + name)); \
  for (const dir of [".", ...dirs]) { \
    const file = dir + "/package.json"; \
    if (!fs.existsSync(file)) continue; \
    const pkg = JSON.parse(fs.readFileSync(file, "utf8")); \
    for (const name of ["preinstall", "install", "postinstall", "preprepare", "prepare", "postprepare"]) delete pkg.scripts?.[name]; \
    fs.writeFileSync(file, JSON.stringify(pkg, null, 2)); \
  }'
RUN if [ -f bun.lock ]; then bun install --production --omit=peer --frozen-lockfile --filter fumadocs; else bun install --production --omit=peer --filter fumadocs; fi
# Hoisting package managers may leave this empty; the runner copies it either way.
RUN mkdir -p apps/fumadocs/node_modules

# react-router-serve runs on Node.
FROM node:24-slim AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3000
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/apps/fumadocs/node_modules ./apps/fumadocs/node_modules
COPY --from=builder /app/apps/fumadocs/package.json ./apps/fumadocs/package.json
COPY --from=builder /app/apps/fumadocs/build ./apps/fumadocs/build
WORKDIR /app/apps/fumadocs
EXPOSE 3000
CMD ["node", "node_modules/@react-router/serve/bin.cjs", "./build/server/index.js"]
