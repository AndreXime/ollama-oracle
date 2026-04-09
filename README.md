# Ollama Oracle

Chatbot corporativo com **RAG local**: documentos em `server/data_source`, embeddings e busca vetorial no **ChromaDB**, geração com **Ollama**. Monorepo em **Bun** com API (**Fastify** + TypeScript) e interface (**React** + **Vite** + **Tailwind CSS v4**).

Para detalhes “por baixo dos panos” (ingest, partes vs chunks, RAG/streaming, env vars), veja [UNDER_THE_HOOD.md](UNDER_THE_HOOD.md).

## Stack

| Camada | Tecnologias |
|--------|-------------|
| Runtime / pacotes | Bun |
| API | Fastify 5, Zod, LangChain.js, `@langchain/ollama`, `@langchain/community` (Chroma) |
| IA | Ollama — chat `llama3.2:3b`, embeddings `nomic-embed-text` |
| Vetores | ChromaDB |
| UI | React, Vite , TailwindCSS |

## Pré-requisitos

- Bun, Ollama e Docker instalados.

**Ollama** — o `server/.env.example` assume API em `http://127.0.0.1:11434` (padrão do Ollama) e os modelos `llama3.2:3b` (chat) e `nomic-embed-text` (embeddings).

```bash
ollama pull llama3.2:3b
ollama pull nomic-embed-text
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

Copie os exemplos de ambiente e ajuste conforme necessário:

```bash
cp server/.env.example server/.env
cp client/.env.example client/.env
```

## Indexação (ingestão)

Os arquivos em `server/data_source/` são lidos, fragmentados e enviados ao Chroma com `nomic-embed-text`.

```bash
bun run ingest
```

Na primeira execução ou para reindexar do zero, o script recria a coleção configurada em `CHROMA_COLLECTION`.

## Desenvolvimento

API e client em paralelo. Frontend em `http://127.0.0.1:5173`. API em `http://127.0.0.1:3001`.

```bash
bun run dev
```