# Ollama Oracle

Chatbot corporativo com **RAG local**: documentos em `server/data_source`, embeddings e busca vetorial no **ChromaDB**, geração com **Ollama**. Monorepo em **Bun** com API (**Hono** + TypeScript) e interface (**React** + **Vite** + **Tailwind CSS v4**).

Para detalhes "por baixo dos panos" (ingest, partes vs chunks, RAG/streaming, env vars), veja [UNDER_THE_HOOD.md](UNDER_THE_HOOD.md).

## Stack

| Camada | Tecnologias |
|--------|-------------|
| Runtime / pacotes | Bun |
| API | Hono, Zod, LangChain.js, `@langchain/ollama`, `@langchain/community` (Chroma) |
| IA | Ollama — chat `qwen2.5:3b`, embeddings `bge-m3` |
| Vetores | ChromaDB |
| UI | React, Vite, TailwindCSS |

## Pré-requisitos

- Bun, Ollama e Docker instalados.

**Ollama** — o `server/.env.example` assume API em `http://127.0.0.1:11434` (padrão do Ollama) e os modelos `qwen2.5:3b` (chat) e `bge-m3` (embeddings).

```bash
ollama pull qwen2.5:3b
ollama pull bge-m3
```

**ChromaDB** — o `.env.example` usa `http://127.0.0.1:8000`.

```bash
docker compose up -d
```

## Instalação

Na raiz do repositório:

```bash
bun install
```

Copie o exemplo de ambiente do server e ajuste conforme necessário:

```bash
cp server/.env.example server/.env
```

## Indexação (ingestão)

Os arquivos em `server/data_source/` são lidos, fragmentados e enviados ao Chroma com `bge-m3`. Ao trocar `OLLAMA_EMBED_MODEL`, reindexe com `bun run ingest`.

```bash
bun run ingest
```

Na primeira execução ou para reindexar do zero, o script recria a coleção configurada em `CHROMA_COLLECTION`.

## Desenvolvimento

Build do client em watch + API com reload. Tudo servido em `http://127.0.0.1:3001`.

```bash
bun run dev
```

## Produção

```bash
bun run build
bun run start   # API + UI em dist/ (http://127.0.0.1:3001)
```

## Testes

```bash
bun run test
```

## Health check

`GET /health` verifica conectividade com Ollama (modelos de chat e embed) e Chroma (coleção configurada). Retorna `200` quando tudo está ok, `503` caso contrário.
