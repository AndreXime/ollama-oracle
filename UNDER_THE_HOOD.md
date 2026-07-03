# Under the hood: Ollama Oracle

Este documento explica **como o projeto funciona internamente** (ingestão, indexação, retrieval e chat), e o significado de alguns termos que aparecem nos logs.

## Visão geral (arquitetura)

- **`server/`**: API (Hono) + pipeline de ingestão (LangChain) + integrações (Chroma + Ollama).
- **`client/`**: UI que consome o endpoint de chat.
- **Chroma**: banco vetorial onde os *chunks* (trechos) são armazenados com embeddings.
- **Ollama**: roda o modelo de chat e o modelo de embeddings localmente.

## Fluxo de ingestão (indexação da base)

Arquivo principal: `server/src/modules/ingest/ingest.ts`

1. O script varre `DATA_SOURCE_DIR` recursivamente e lê apenas extensões suportadas (`.md`, `.txt`, `.json`, `.csv`).
2. Cada arquivo vira uma lista de **partes** (blocos de texto "brutos", antes de quebrar em chunks).
3. Cada parte vira um `Document` e passa pelo **splitter**, que quebra em **chunks** (trechos menores, com overlap).
4. Os chunks são enviados ao Chroma via `addDocuments()` em batches (`EMBED_BATCH_SIZE`), com concorrência limitada (`INGEST_ADD_CONCURRENCY`).

### O que significa "partes"

"**Parte**" é um *bloco bruto* gerado pelo loader do arquivo, **antes** do splitter:

- **`.md` / `.txt`**: normalmente **1 parte** = o arquivo inteiro como texto.
- **`.csv`**: vira **N partes** (geralmente 1 parte por linha/registro) para ficar mais recuperável.
- **`.json`**: tenta extrair "subdocumentos":
  - `string` → 1 parte
  - `string[]` → 1 parte por item
  - `{ content: string }` → 1 parte
  - `{ documents: string[] }` → 1 parte por item
  - fallback → 1 parte com `JSON.stringify(...)`

Depois, **cada parte vira vários chunks** (depende do tamanho e do splitter). Por isso o log foi ajustado para mostrar `partes=...` e `chunks=...`.

### Metadados dos chunks (sources)

Durante a ingestão, cada chunk recebe `metadata` para rastreio:

- **`source`**: caminho relativo do arquivo dentro de `DATA_SOURCE_DIR`
- **`partIndex`**: índice da parte dentro do arquivo (útil para CSV/JSON)
- **`chunkIndex`**: índice do chunk dentro da parte

No chat, isso aparece como uma referência do tipo:

`arquivo.md#p0-c12`

## Fluxo do chat (RAG)

Arquivos principais:

- `server/src/modules/chat/routes.ts` (`POST /chat`)
- `server/src/modules/chat/ragChat.ts` (retrieval + decisão "usar RAG ou não" + stream do LLM)
- `server/src/modules/chat/chatHistory.ts` (histórico curto + query de retrieval enriquecida)
- `server/src/modules/chat/prompts.ts` (prompts e montagem do contexto)

### Passos

1. O cliente faz `POST /chat` com `{ question, history? }`.
2. O server normaliza o histórico (`CHAT_HISTORY_MAX_MESSAGES`) e monta a query de retrieval com turnos recentes (útil para follow-ups).
3. Faz retrieval no Chroma via `similaritySearchWithScore(query, limit)`.
4. Aplica filtros de distância:
   - **`CHROMA_MAX_RETRIEVAL_DISTANCE`**: remove chunks "fracos" individualmente.
   - **`CHROMA_MAX_BEST_DISTANCE`**: se nem o melhor chunk for bom, **desliga RAG** e responde no modo conversacional (sem fontes).
5. Deduplica chunks recuperados por conteúdo (evita repetir o mesmo trecho no prompt).
6. Monta mensagens LangChain: system + histórico (Human/AI) + pergunta atual com contexto RAG.
7. Faz **stream** do modelo do Ollama.
8. O endpoint responde em **NDJSON** (`application/x-ndjson`), emitindo eventos do tipo:
   - `delta` (texto incremental)
   - `done` (com `sources`)

### Abort no disconnect

Se o cliente desconecta durante o streaming:

- o server dispara um abort (`AbortController`)
- o stream é encerrado **sem** enviar evento de erro (evita poluir logs/UX com "timeout" quando foi o usuário que fechou)

O client também cancela o fetch anterior ao enviar uma nova pergunta (`AbortController` no `ChatWindow`).

## Health check

`GET /health` (`server/src/shared/health.ts`):

- **Ollama**: `GET /api/tags` e verifica se os modelos de chat e embed configurados estão disponíveis.
- **Chroma**: `heartbeat()` + existência da coleção `CHROMA_COLLECTION`.

Retorna `200` com `{ ok: true, ollama, chroma }` ou `503` se alguma dependência falhar.

## Configuração via `.env`

O `server/src/config/schema.ts` valida as variáveis via `zod` (falha cedo se estiverem faltando/inválidas).

Principais variáveis:

- **Core**
  - `PORT`
  - `DATA_SOURCE_DIR`
- **Ollama**
  - `OLLAMA_BASE_URL`
  - `OLLAMA_CHAT_MODEL`
  - `OLLAMA_EMBED_MODEL`
- **Chroma**
  - `CHROMA_URL`
  - `CHROMA_COLLECTION`
  - `CHROMA_MAX_RETRIEVAL_DISTANCE` (opcional)
  - `CHROMA_MAX_BEST_DISTANCE` (opcional)
- **Chat**
  - `CHAT_TOP_K`
  - `CHAT_PROMPT_MAX_CHUNKS`
  - `CHAT_HISTORY_MAX_MESSAGES`
- **Ingest**
  - `MAX_FILE_BYTES`
  - `EMBED_BATCH_SIZE`
  - `INGEST_ADD_CONCURRENCY`
- **CORS**
  - `CORS_ORIGINS=*` para liberar qualquer origem, ou CSV de URLs para restringir.

## Onde mexer quando precisar ajustar qualidade/performance

- **Respostas muito "soltas" / sem fontes**: ajuste `CHROMA_MAX_*` e/ou aumente `CHAT_TOP_K`.
- **Follow-ups sem contexto**: aumente `CHAT_HISTORY_MAX_MESSAGES`.
- **Prompt estourando contexto**: reduza `CHAT_TOP_K` ou `CHAT_HISTORY_MAX_MESSAGES`, aumente chunking (menor `chunkSize`) ou dedupe mais agressivo.
- **Ingest lento**: aumente `EMBED_BATCH_SIZE` e `INGEST_ADD_CONCURRENCY` com cuidado (pode saturar o Ollama).

## Testes

Testes unitários com `bun:test`:

```bash
bun run test
```

Cobertura principal: parsers de config, histórico RAG, lexical match, dedupe de chunks e parsing NDJSON no client.
