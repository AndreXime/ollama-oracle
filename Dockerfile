# syntax=docker/dockerfile:1

FROM oven/bun:1.3.11 AS build

WORKDIR /app

COPY package.json bun.lock bunfig.toml ./
COPY client/package.json ./client/
COPY server/package.json ./server/

RUN bun install --frozen-lockfile

COPY client ./client
COPY server ./server
COPY data_source ./data_source

RUN bun run build

# Imagem one-shot: indexa data_source no Chroma
FROM build AS ingest

WORKDIR /app

CMD ["bun", "run", "--filter", "nexus-rag-oracle-server", "ingest"]

FROM oven/bun:1.3.11-slim AS runtime

WORKDIR /app

ENV NODE_ENV=production

COPY --from=build /app/dist ./dist

EXPOSE 3001

HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
	CMD bun -e "fetch('http://127.0.0.1:3001/health').then((r) => process.exit(r.ok ? 0 : 1)).catch(() => process.exit(1))"

CMD ["bun", "dist/server/index.js"]
