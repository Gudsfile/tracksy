# LLM observability: traces, evals and the Langfuse dashboard

How to see what the in-browser assistant did, why a turn failed or was slow, and
whether a prompt change helped. Everything here is **dev only**: none of it is in
a production build (`moon run app:assert-no-dev-code` checks that).

- [1. Get traces](#1-get-traces)
- [2. Read a trace](#2-read-a-trace)
- [3. The Langfuse dashboard](#3-the-langfuse-dashboard)
- [4. Debug a failed or slow turn](#4-debug-a-failed-or-slow-turn)
- [5. Run evals](#5-run-evals)
- [6. What leaves the machine](#6-what-leaves-the-machine)
- [7. Caveats](#7-caveats)
- [8. Reference: attributes](#8-reference-attributes)

## 1. Get traces

1. `moon run app:dev` and open <http://localhost:4321/tracksy>.
2. Load the demo dataset (the ↓ button), open **Chat (beta)**, ask a question.
3. Open the **Tracksy LLM** app in the Astro dev toolbar (the branch icon). The
   **Traces** tab shows one card per turn, newest first.

To send traces to Langfuse, set the three variables in `app/.env` (see
`.env.example`) and restart the dev server:

```bash
LANGFUSE_BASE_URL=https://cloud.langfuse.com
LANGFUSE_PUBLIC_KEY=pk-lf-...
LANGFUSE_SECRET_KEY=sk-lf-...
```

Then click **Send to Langfuse** in the Traces tab. It sends only the spans that
have **ended** and were **not sent before**. Click as often as you like: it never
duplicates (Langfuse does not de-duplicate re-sent spans, so a duplicate would
double every count on the dashboard). A turn whose narrator is still streaming
is sent on the next click. The **auto** checkbox sends each eval run when it
finishes.

No account? `moon run app:fake-langfuse` starts a local stub on `:3999`; point
`LANGFUSE_BASE_URL` at `http://localhost:3999`. It shows what would be sent,
without the Langfuse UI.

## 2. Read a trace

One trace is one **turn** (one question, one answer). It looks like this:

```text
assistant-turn                      13.5s  outcome:ok   ← root: what the user waited for
├─ model-load                              ← only when the turn waited for a model
├─ router                           10.6s  ← step: picks the intent, writes SQL
│  └─ chat Qwen2.5-Coder-1.5B…      10.6s  ← model call: tokens, TTFT, tok/s
├─ validateSql                       <1ms  ← guardrail
├─ query                              5ms  ← DuckDB
├─ sql-correction                          ← only when the first query failed
│  ├─ chat …                               ← the corrected router call
│  ├─ validateSql
│  └─ query
├─ chart                             0.8s  ← step: picks the chart (fallback here)
│  └─ chat …
└─ narrator                          2.1s  ← step: streams the summary
   └─ chat …
```

Rules that make it readable:

- **A step owns its model call.** The step (`router`, `chart`, `narrator`) says
  whether the step worked. The `chat …` call under it says how the model call
  went. They can disagree: a model call that returned unparseable JSON is `ok`,
  and its `router` step is `error` with `error.type = parse`.
- **The root covers the whole turn**, including the narrator stream and any wait
  for a model load. Root duration = what the user sat through.
- **Statuses:** `error` = the step failed. `skipped` (orange in the toolbar,
  WARNING in Langfuse) = cancelled by the user, or degraded but recovered (chart
  fallback). Neither counts as an error.
- Model loads that no turn waits for (first load, switch in Settings) are their
  own `model-load` trace.

Each conversation is one Langfuse **session** (`session.id`). A new session
starts when a question arrives with no history. An eval run is one session too.

## 3. The Langfuse dashboard

**Tracksy · Assistant health**: Langfuse → Dashboards. Read it top to bottom,
like a production service dashboard: first "is it healthy?", then "what fails
and why?", then "is it the model or the GPU?".

```text
┌────────────┬──────────────┬────────────────────┬──────────────────┐
│   Turns    │ Failed turns │  Turn latency p95  │ Router TTFT p50  │  1. Is it healthy?
├────────────┴──────────────┼────────────────────┴──────────────────┤
│ Turn outcomes (donut)     │ Turn latency over time (p95)          │  2. Is it getting worse?
├───────────────────────────┼───────────────────────────────────────┤
│ Failure causes            │ Degradations                          │  3. What fails, and why?
├───────────────────────────┼───────────────────────────────────────┤
│ Step latency (p95)        │ Time to first token by model (p50)    │  4. Where does time go?
├───────────────────────────┼───────────────────────────────────────┤
│ Decode speed by model     │ Model load time (p50)                 │  5. Model or GPU?
├───────────────────────────┴───────────────────────────────────────┤
│ Turns over time by environment                                    │  6. Traffic: chat vs evals
└───────────────────────────────────────────────────────────────────┘
```

**Which data each widget uses.** Rows 1–3 and Step latency use only
`environment = dev`: real chat, the "production" traffic. Eval runs are
synthetic and would skew the health numbers. The model and GPU widgets use `dev`
and `eval`, for more samples. No widget uses `default`: those are traces
exported before environments existed. The dashboard's own **Env** selector can
narrow it further.

| Widget                         | Answers                                      | Definition                                                                                                |
| ------------------------------ | -------------------------------------------- | --------------------------------------------------------------------------------------------------------- |
| Turns                          | How much traffic?                            | count of `assistant-turn`                                                                                 |
| Failed turns                   | How many turns failed?                       | count of `assistant-turn` at level ERROR                                                                  |
| Turn latency p95               | How long does a slow turn take?              | latency P95 of `assistant-turn` (includes narrator and model-load wait)                                   |
| Router TTFT p50                | How long before the router starts answering? | time to first token P50 of generations with metadata `agent = router`                                     |
| Turn outcomes                  | What share of turns work?                    | `assistant-turn` by level: DEFAULT = ok, WARNING = degraded (chart fallback) or cancelled, ERROR = failed |
| Turn latency over time         | Is latency drifting?                         | latency P95 of `assistant-turn`, time series                                                              |
| Failure causes                 | Why do turns fail?                           | failed `assistant-turn` by tags (`outcome:*` + `error:*`)                                                 |
| Degradations                   | What went wrong without failing?             | turns tagged `retried`, `chart-fallback`, `waited-for-model` or `cancelled`, by tags                      |
| Step latency (p95)             | Which step is slow?                          | latency P95 of `assistant-turn`, `router`, `chart`, `narrator`, `sql-correction`                          |
| Time to first token by model   | Prefill cost per model                       | TTFT P50 of generations, by model                                                                         |
| Decode speed by model          | GPU decode speed per model                   | output tokens/s of generations, by model                                                                  |
| Model load time                | How long does a load take?                   | latency P50 of `model-load`, by tags (`load:*`, `model:*`)                                                |
| Turns over time by environment | Chat vs eval volume                          | count of `assistant-turn` per hour, by environment                                                        |

### Triage: a turn failed, what now?

1. **Failed turns** is above zero. Look at **Failure causes**: the bar label is
   the tag combination, e.g. `outcome:llm-error, error:schema`.
2. In Tracing, filter by that tag (Trace Tags → `error:schema`) to list those
   turns.
3. Open one. The step marked `error` holds the reason. With content export on
   (§6), its Input/Output show the question, the model's output and the SQL.
4. Check whether it repeats on the same intent (metadata `intent`) or the same
   model (`model_id`). If it does, an eval case will catch a regression; add one to
   `src/llm/evals/cases.ts`.

### Trace tags

The root of each trace carries a few tags. Widgets that break down by tags show
the **combination**, so the set stays small on purpose:

| Tag                               | Meaning                                                                                                                                                                                                   |
| --------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `outcome:ok`                      | The user got an answer                                                                                                                                                                                    |
| `outcome:llm-error`               | The router failed (engine error, or output not parseable)                                                                                                                                                 |
| `outcome:sql-error`               | The SQL failed twice (first try and retry)                                                                                                                                                                |
| `outcome:unsafe-sql`              | The guardrail rejected the SQL                                                                                                                                                                            |
| `outcome:aborted` + `cancelled`   | The user cancelled                                                                                                                                                                                        |
| `error:<type>`                    | On a failed turn: the error class of the **first step that failed**. `parse` / `schema` (router output), `engine` (WebLLM), `unsafe-sql` (guardrail), `Binder Error` / `Parser Error`… (DuckDB), `_OTHER` |
| `retried`                         | The first SQL failed and the retry ran                                                                                                                                                                    |
| `chart-fallback`                  | The chart agent's answer was unusable; the heuristic was used                                                                                                                                             |
| `waited-for-model`                | The turn waited for a model load                                                                                                                                                                          |
| `model-load`, `load:*`, `model:*` | On model-load traces: reason (`initial` / `switch`) and model                                                                                                                                             |

`error:<type>` is a class, never a message, so it is exported even when content
is stripped. Traces exported before it existed show only `outcome:*`, and some
very early ones have no tags at all.

### Filtering by metadata

These root attributes are filterable as **trace metadata** (Tracing → Filters →
Metadata, or a widget filter): `payload_kind`, `error_type`, `model_id`,
`intent`, `chart_mode`, `narrative_mode`, `eval_case`, `retried`,
`chart_fallback`, `cancelled`, `engine_reused`, `model_load_reason`. For
example, `eval_case = top-artists` lists every run of one golden case.

### Changing a widget

Langfuse → Dashboards → **Widgets** lists every `Tracksy · …` widget; edit one
there and the dashboard updates. Two older widgets, "Turns by outcome" and
"Errors and degradations by step", still exist but are no longer on the
dashboard: Failure causes, Degradations and Step latency replace them. The
**Halo** assistant (top right in Langfuse) can create or update a widget from a
description; it asks for approval before each change.

## 4. Debug a failed or slow turn

**A turn failed.**

1. Dashboard → Failure causes, or toolbar Traces tab, or Langfuse → Tracing
   filtered on level ERROR.
2. Open the trace. Find the step marked `error`; its `error.type` says why:

    | Step          | `error.type`                      | Usually means                                                       |
    | ------------- | --------------------------------- | ------------------------------------------------------------------- |
    | `router`      | `parse` / `schema`                | The model wrote invalid JSON / a JSON without a valid intent or SQL |
    | `router`      | `engine`                          | WebLLM itself failed (device lost, engine disposed)                 |
    | `validateSql` | `unsafe-sql`                      | The guardrail blocked it; `tracksy.sql_rejection` says which rule   |
    | `query`       | `Binder Error`, `Parser Error`…   | DuckDB rejected the SQL (the DuckDB error class)                    |
    | `chart`       | (WARNING) `chart_fallback_reason` | `no-json`, `invalid-json`, `schema` or `engine`                     |

3. Locally (toolbar), expand the spans to see the prompt, the completion, the
   SQL and the full error message. These are **not** in Langfuse Cloud (see §6).

**A turn was slow.** Open the trace's Timeline view. Typical causes:

- a long `router`: look at its `chat …` call. High TTFT = big prompt (prefill).
  Low tok/s = slow GPU. Many output tokens = verbose model.
- a `model-load` span: the turn waited for a model download or compile.
- an `sql-correction` span: a second router call and query.
- the `narrator` streams after the chart. It is in the root duration on purpose.

## 5. Run evals

Toolbar → **Evals** tab → tick **chart** / **narrator** if you are tuning those
agents → **Run suite**. Each golden case (`src/llm/evals/cases.ts`) runs the exact
production pipeline and gets deterministic checks:

| Check         | Fails when                                                        |
| ------------- | ----------------------------------------------------------------- |
| `intentMatch` | The router picked another intent                                  |
| `paramsMatch` | Year / limit were not extracted as the question states            |
| `sqlValid`    | The guardrail rejected the SQL                                    |
| `sqlExecuted` | DuckDB failed (after the retry)                                   |
| `shapeOk`     | Rows or columns don't fit what the renderer needs                 |
| `noRetry`     | The first SQL failed, even if the retry fixed it                  |
| `narratorOk`  | (narrator on) empty narrative, or it does not name the top result |

A run is compared only with an earlier run with the same model, chart mode,
narrative mode and dataset. Otherwise the panel says why it refuses. Each case
links to its trace; failed cases expand in place. With **auto** on, the run's
traces go to Langfuse as environment `eval`, one session per run.

## 6. What leaves the machine

For a remote `LANGFUSE_BASE_URL` (Langfuse Cloud), the dev proxy keeps **only
allow-listed attributes** (`EXPORTABLE_KEYS` in
`src/devToolbar/redactSpanContent.ts`) and drops every status message.

| Sent                                                                | Not sent                                                           |
| ------------------------------------------------------------------- | ------------------------------------------------------------------ |
| Span tree, names, durations, statuses, `error.type`                 | Prompts and completions (`gen_ai.prompt` / `completion`)           |
| Model, token counts, TTFT, WebLLM tok/s                             | The question (`tracksy.question`)                                  |
| Intent, row counts, retry / fallback / cancel flags, tags, metadata | The SQL (`tracksy.sql`): it can quote values from the question     |
| Session id, environment                                             | Error messages (DuckDB echoes values)                              |
|                                                                     | Every Input / Output preview (`langfuse.observation.input/output`) |
|                                                                     | Any attribute added later and not listed                           |

`LANGFUSE_EXPORT_CONTENT=true` sends everything, for synthetic data only. With a
local `LANGFUSE_BASE_URL` (`localhost`), content is sent by default.

### Why Input / Output show `undefined` in Langfuse Cloud

That is the redaction working. Langfuse fills a span's Preview from its
input/output attributes, and those are content, so the proxy removes them for a
remote host. Timings, tokens, statuses and the tree are still there.

To see the content, either:

- point `LANGFUSE_BASE_URL` at a **local** Langfuse (content is sent by default), or
- set `LANGFUSE_EXPORT_CONTENT=true` in `app/.env`, restart `moon run app:dev`, and
  use the **demo dataset only**: the narrator prompt embeds a sample of the
  listening history, and the SQL can quote names from the question.

With content on, each span shows:

| Span             | Input           | Output                                  |
| ---------------- | --------------- | --------------------------------------- |
| `assistant-turn` | the question    | outcome, intent, error message          |
| `router`         | the question    | intent and SQL (or the parse error)     |
| `validateSql`    | the SQL         | ok, or the rejection rule               |
| `query`          | the SQL         | row count, or the DuckDB error          |
| `chart`          | —               | fallback yes/no, reason, parser message |
| `narrator`       | —               | narrative length, or the error          |
| `chat …` calls   | prompt messages | completion text                         |

These previews are built at export time (`contentAttributes` in
`src/devToolbar/panels/langfuseFlavour.ts`). The local toolbar always shows the
full attributes, whatever the setting.

## 7. Caveats

- **Input tokens are not the prompt size.** When WebLLM reuses its KV cache
  between calls, `prompt_tokens` counts only the newly prefilled tokens: the
  first router call reports ~3,000 and the next ones ~16. Don't read
  `input_tokens` as cost or prompt length; use TTFT for prefill cost.
- **Cost is empty.** The models run locally; Langfuse has no price for them.
- **Decode speed** is Langfuse's output tokens / generation time, which includes
  prefill. For the pure decode rate, read `webllm_otel.usage.decode_tokens_per_s`
  on a generation (in its metadata).
- **Small samples.** Evals run once per case at temperature 0.1–0.3. A single
  "regressed" case can be noise; rerun before you trust a one-case change.
- Traces exported before these changes have flat trees, no environment, and
  `case:*` tags. They remain in the 7-day window.

## 8. Reference: attributes

| Attribute                                                        | On              | Meaning                                                     |
| ---------------------------------------------------------------- | --------------- | ----------------------------------------------------------- |
| `gen_ai.request.model`, `gen_ai.response.model`                  | model call      | The WebLLM model id                                         |
| `gen_ai.usage.input_tokens` / `output_tokens`                    | model call      | As reported by WebLLM (see §7)                              |
| `gen_ai.response.time_to_first_chunk`                            | model call      | TTFT in seconds, from WebLLM                                |
| `webllm_otel.usage.prefill_tokens_per_s`                         | model call      | WebLLM prefill rate                                         |
| `webllm_otel.usage.decode_tokens_per_s`                          | model call      | WebLLM decode rate                                          |
| `gen_ai.request.stream`                                          | model call      | `true` for the narrator                                     |
| `error.type`                                                     | any failed span | `LLMError.kind`, DuckDB error class, `unsafe-sql`, `_OTHER` |
| `session.id`                                                     | every span      | Conversation, or eval run                                   |
| `deployment.environment.name`                                    | every span      | `dev` or `eval`                                             |
| `tracksy.intent`                                                 | root            | The router's intent                                         |
| `tracksy.payload_kind`                                           | root            | `ok`, `llm-error`, `sql-error`, `unsafe-sql`, `aborted`     |
| `tracksy.retried`, `tracksy.chart_fallback`, `tracksy.cancelled` | root            | Flags for the turn                                          |
| `tracksy.error_type`                                             | root            | On a failed turn: error class of the first failing step     |
| `tracksy.engine_reused`                                          | root            | `false` when the turn waited for a model load               |
| `tracksy.chart_fallback_reason`                                  | `chart` step    | `no-json`, `invalid-json`, `schema`, `engine`               |
| `tracksy.narrative_chars`                                        | `narrator` step | Length of the streamed narrative                            |
| `tracksy.question`, `tracksy.sql`                                | root / `query`  | Local only (stripped for remote hosts)                      |

The Langfuse-only keys (`langfuse.trace.tags`, `langfuse.trace.metadata.*`,
`langfuse.observation.type` / `level` / `completion_start_time`) are added at
export time by `src/devToolbar/panels/langfuseFlavour.ts`, never by the pipeline.
