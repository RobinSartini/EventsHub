FROM oven/bun:1.3.14 AS base
WORKDIR /app

FROM base AS builder
# react-router build must run on real Node: under the bun shim, react-dom/server lacks renderToPipeableStream.
COPY --from=node:24-slim /usr/local/bin/node /usr/local/bin/node
ARG DATABASE_URL="postgresql://build:build@localhost:5432/build"
COPY . .
# Git hook setup needs git, which the image does not have.
RUN bun pm pkg delete scripts.prepare
RUN if [ -f bun.lock ]; then bun install --frozen-lockfile; else bun install; fi
ARG VITE_SERVER_URL=http://localhost:3000
ENV VITE_SERVER_URL=${VITE_SERVER_URL}
RUN bun run --filter web build
RUN sed -e "s|__SCRIPT_HASHES__|$(bun apps/web/scripts/csp-script-hashes.ts apps/web/build/client/index.html)|" \
  -e "s|__API_ORIGIN__|${VITE_SERVER_URL}|" \
  apps/web/nginx.conf > /app/nginx.conf

FROM nginx:alpine AS runner
COPY --from=builder /app/apps/web/build/client /usr/share/nginx/html
COPY --from=builder /app/nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 3000
CMD ["nginx", "-g", "daemon off;"]
