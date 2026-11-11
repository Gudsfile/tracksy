# App — AGENTS.md

Astro + React web app. DuckDB WASM for client-side data processing.

[Root AGENTS.md](../AGENTS.md)

## Dev

```bash
moon run app:dev            # Start dev server
moon run app:build          # Type-check + build
moon run app:preview        # Preview production build
```

For raw pnpm commands (adding deps, etc.) — use sparingly:

```bash
moon run app:pnpm -- add <package>
```

## Code Style

- TypeScript strict mode
- File naming: kebab-case files, PascalCase components, camelCase functions
- Components: `.astro` for static content, `.tsx` for interactive React
- Follow Astro's islands architecture pattern
- Components: focused, single-purpose; separate business logic from UI

Quality checks:

```bash
moon run app:format          # Format with Prettier
moon run app:format-check    # Check formatting
moon run app:lint            # ESLint
moon run app:lint-fix        # Auto-fix lint
moon run app:lint-sql        # SQL lint (sqruff)
moon run app:lint-fix-sql    # Auto-fix SQL lint
moon run app:typecheck       # TypeScript type-check
```

## Testing

```bash
moon run app:test                          # Run all tests
moon run app:test-coverage                 # Coverage report
moon run app:test -- -t "<test name>"      # Focus a specific test
moon run app:test -- <file path>           # Focus a specific file
```

All tests must pass before committing. Add/update tests for any code changes.

**IMPORTANT:** Use `vi.spyOn()` not `vi.mock()` (ESLint enforced):

```ts
// Bad
vi.mock('../db/queries', () => ({ getUser: vi.fn() }))

// Good
import * as queries from '../db/queries'
vi.spyOn(queries, 'getUser').mockResolvedValue(mockUser)
```

Astro outputs raw HTML — e2e tests can use build output. Vitest and React Testing Library for React component tests. See Astro's [testing guide](https://docs.astro.build/en/guides/testing/).

## Architecture

**Data Flow:** User uploads file → `StreamProvider` detects format + parses → DuckDB WASM → Observable Plot/D3.js visualization

Supported formats:

| Provider    | File pattern                            | Notes                                               |
| ----------- | --------------------------------------- | --------------------------------------------------- |
| Spotify     | `Streaming_History_Audio_*.json` or ZIP |                                                     |
| Deezer      | `deezer-data_\d{10}.xlsx`               | Sheet `10_listeningHistory`, DuckDB Excel extension |
| Apple Music | `Apple Music Play Activity.csv`         |                                                     |
| Custom      | `tracksy-custom.csv`                    | Tracksy-specific CSV format                         |

**StreamProvider pattern:** `src/streamProvider/` — extensible adapter for multi-source support. Each provider implements `filePattern`, `readFile()`, `transform()` → canonical `StreamRecord` objects. Register new providers in `index.ts`.

**Key Directories:**

| Path                  | Purpose                                                  |
| --------------------- | -------------------------------------------------------- |
| `src/components/`     | React and Astro components                               |
| `src/pages/`          | Astro page routes                                        |
| `src/db/`             | DuckDB queries and database logic                        |
| `src/streamProvider/` | Provider adapters (Spotify, Deezer, Apple Music, Custom) |
| `src/llm/`            | In-browser assistant: router, guardrail, chart, narrator |
| `src/llm/evals/`      | Golden cases and deterministic scoring (dev only)        |
| `src/devToolbar/`     | Astro dev toolbar apps (dev only)                        |

## The assistant

Runs entirely in the browser on WebGPU via `@mlc-ai/web-llm`. One turn is a chain
of separate model calls, orchestrated by `llm/runAssistantTurn.ts`:

**router** (`askLLM`) → **`validateSql` guardrail** → **DuckDB** → _(one retry on
query failure)_ → **chart** (`askChartConfig`, when `chart: 'llm'`) → **narrator**
(`askNarrator`, when `narrative: 'stream'`).

The pipeline lives outside `useChatEngine` on purpose: the eval runner drives the
same function, which is what makes its scores measure the real path. The hook
keeps only what React owns — resolving the engine and the `AbortController`.

### Observability and evals — dev only

**This whole subsystem must be absent from a production build, not merely
disabled.** `moon run app:assert-no-dev-code` fails the build if any of it
appears in `dist/`, and it runs in CI after every build.

Dev-gating a call site is not enough: a top-level `import` pulls a module into
the bundle even when the branch beneath it is dead code. So:

- `runAssistantTurn` depends on the local `TurnTracer` interface
  (`llm/tracingTypes.ts`) via `import type`, which erases at compile time. Every
  instrumentation call is `tracer?.…`, which short-circuits before its arguments
  are constructed.
- `llm/tracing.ts` is the **only** module with a runtime import of `webllm-otel`,
  and is reached solely through `if (import.meta.env.DEV) await import(…)`.
- `EvalBridge` and both dev toolbar apps are gated the same way; the toolbar apps
  additionally register only when Astro reports `command === 'dev'`.
- `devBus` is swapped for an empty stand-in at build time by the
  `strip-dev-bus-in-production` Vite plugin.

Traces and evals appear in the **Tracksy LLM** dev toolbar app. The toolbar runs
in its own module graph, so it cannot execute evals itself — importing the engine
there would build a second one and download the model twice. It dispatches
commands over `devBus`; `components/dev/EvalBridge.tsx`, which shares the page's
module graph, answers.

`webllm-otel` (`packages/webllm-otel`) is the generic half: engine tracing, a span
store, and OTLP/JSON serialization. It has no Tracksy dependencies and is written
to be extracted and published on its own.

## Environment Variables

See `.env.example` for the full list.

| Variable                  | Required | Purpose                                         |
| ------------------------- | -------- | ----------------------------------------------- |
| `PUBLIC_DEMO_JSON_URL`    | yes      | Demo dataset the app and eval runner load       |
| `LANGFUSE_BASE_URL`       | no       | Langfuse host for trace export                  |
| `LANGFUSE_PUBLIC_KEY`     | no       | Langfuse public key                             |
| `LANGFUSE_SECRET_KEY`     | no       | Langfuse secret key                             |
| `LANGFUSE_EXPORT_CONTENT` | no       | Tri-state override for prompt/completion export |

The three key/host variables are **deliberately not `PUBLIC_`-prefixed**. Astro
inlines `PUBLIC_` variables into client code, and Langfuse's OTLP endpoint
authenticates with Basic auth built from the _secret_ key. The browser therefore
posts spans to a same-origin dev proxy (`langfuseProxy` in `astro.config.mjs`,
`apply: 'serve'`) which attaches the header; the credential never leaves the dev
server. With them unset, the proxy answers 501 and the toolbar's export button is
disabled — nothing else changes.

### Langfuse Cloud

`LANGFUSE_BASE_URL` points at Langfuse Cloud
(`https://cloud.langfuse.com` EU, `https://us.cloud.langfuse.com` US) or a
self-hosted instance. Create a project in Langfuse, copy its public and secret
keys into `.env`, and the toolbar's export button lights up.

Sending traces to a host outside this machine matters here specifically:
`askNarrator` embeds a sample of the user's listening history directly in its
prompt, and the tracer captures `gen_ai.prompt`/`gen_ai.completion` by design —
a failing eval case that doesn't show what the model saw is useless. So the
proxy strips those two attributes at export **whenever the target isn't
local**, regardless of what set `LANGFUSE_BASE_URL`. This is enforced in the
proxy, not the client, so nothing that POSTs to `/__langfuse/v1/traces` — the
toolbar, a curl during debugging, a future script — can opt out of it.
`LANGFUSE_EXPORT_CONTENT` overrides the auto behaviour when set to `true`
(never strip — for deliberate use against synthetic data) or `false` (always
strip, even locally); leave it unset for the safe default.

**What is exported:** model id, token counts, durations, statuses, error
kinds, `tracksy.intent`, `tracksy.sql`, `tracksy.row_count`, retry markers, the
full span tree, and `tracksy.question` (what the user typed).
**What is stripped when the target is remote:** `gen_ai.prompt` and
`gen_ai.completion` — the model's actual input and output text.
`tracksy.sql` is model-authored and names tables/columns, never row values, so
it stays; `tracksy.question` stays because a trace without it is unreadable.
Both are judgement calls, not blanket "content is stripped" — read them as
exactly what they say.

**Verifying this:**

| Path  | Command                      | Proves                                                  |
| ----- | ---------------------------- | ------------------------------------------------------- |
| Stub  | `moon run app:fake-langfuse` | client → proxy → auth → redaction, no account needed    |
| Cloud | set the three key vars       | the above, plus how Langfuse actually renders the trace |

The stub (`scripts/fake-langfuse.mjs`) is a dependency-free local HTTP server
on `:3999` that logs the request path, whether an `authorization` header was
sent, the span count, and whether any `gen_ai.prompt`/`gen_ai.completion`
attribute survived — then answers `207`. It cannot show how Langfuse
_interprets_ a payload; only a real Cloud project can. Recommended first real
run: the demo dataset, so the first thing that ever leaves the machine is
synthetic.
