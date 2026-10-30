# Dockerfile for EventsHub React Router app
# Optimized multi-stage build for Docker deployment

FROM oven/bun:1 AS builder

WORKDIR /app

COPY package.json bun.lock* ./
RUN bun install --frozen-lockfile

COPY . .
RUN bun run build

FROM oven/bun:1-slim AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000

COPY --from=builder /app/build ./build
COPY --from=builder /app/package.json ./

RUN bun install --production --frozen-lockfile

EXPOSE 3000

CMD ["bun", "run", "./build/server/index.js"]
