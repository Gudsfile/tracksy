---
date: 2026-11-21
draft: true
title: "Dev-Only LLM Observability and Evals for the In-Browser Assistant"
---

## Context and Problem Statement

The [in-browser assistant](../in-browser-ai-assistant/) answers a question with a chain of steps: a router model call writes SQL, a guardrail validates it, DuckDB runs it (with one retry on error), then a chart agent and a narrator each make their own model call. All three agents share one small WebLLM model, so each step can fail in its own way.

The only signal was a single `webllm:inference` event. It kept only the last measurement and could not tell the router, chart and narrator apart. When an answer was wrong there was nothing to read, and when a prompt changed there was no way to tell whether it got better or worse.

Constraints that shape the design:

- Tracksy is privacy-first. The narrator prompt embeds a sample of the user's listening history, and the SQL can quote values from the question, so captured content is user data.
- The app is a static site with no backend, and none of this tooling may reach a production build.
- The engine runs in the page through WebLLM. Existing LLM instrumentations target server-side SDKs and authenticate with a secret key, which a browser cannot hold.
- The model is small and nondeterministic, so "did it get better" needs repeatable cases, not impressions from a chat session.

## Considered Options

### Option 1: Richer devBus events and console logs

Keep the existing event bus and add one event per agent.

**Pros:**

- No new code paths or dependencies

**Cons:**

- Events have no parent/child structure, so a retry or a fallback cannot be tied to the turn that caused it
- No standard format, so no off-the-shelf tool can display or aggregate them

### Option 2: A vendor SDK in the browser

Use Langfuse's JavaScript SDK directly in the page.

**Pros:**

- Langfuse's own data model, with no mapping layer

**Cons:**

- Langfuse authenticates ingestion with a key pair that includes the secret key, which would have to ship in client code
- Locks the trace format to one backend

### Option 3: OpenTelemetry JS SDK with a custom WebLLM instrumentation

`@opentelemetry/api` plus `sdk-trace-web` and the OTLP HTTP exporter, with a hand-written wrapper around the WebLLM engine.

**Pros:**

- Standard span processors, batching, retries and spec-correct status, event and array handling
- The instrumentation would depend only on `@opentelemetry/api`, the usual shape for an instrumentation library

**Cons:**

- Several packages to wire up for a dev-only tool
- The WebLLM wrapper still has to be written, since none exists

This option was not prototyped. The comparison comes from the OpenTelemetry JS documentation, not from a spike.

### Option 4: A small dependency-free `webllm-otel` package, app-owned step spans, and a dev proxy to Langfuse

A workspace package wraps the WebLLM engine, stores spans and serializes them to OTLP/JSON. The app opens a step span per agent, and a same-origin dev proxy forwards OTLP to Langfuse with the credential attached.

**Pros:**

- No dependencies, and extraction-ready as a standalone package
- Speaks OTLP and the GenAI semantic conventions, so any OTLP backend can read it
- The secret stays on the dev server

**Cons:**

- Re-implements a small part of the OpenTelemetry SDK, which has to be maintained and kept spec-correct by hand

### Evals: how to score a turn

- **LLM-as-judge**: a 0.5B to 1.5B model grading itself shares every failure mode of what it grades.
- **External eval tool** (promptfoo, Langfuse experiments): needs a provider that drives the in-browser engine, which neither has.
- **Deterministic checks on golden cases**, run through the production pipeline in the dev server. ← chosen

## Decision Outcome

Chosen option: **Option 4**, with deterministic evals, because it is the only option that gives a causal per-step trace and a repeatable eval loop without a backend, a client-side secret, or any code in the production bundle.

Option 3 was the strongest alternative. Option 4 won because every piece of it is dev-only and tree-shaken out of production, so bundle size and dependency count don't matter for the app. What tipped it was the goal of a small, extractable WebLLM instrumentation with no dependencies. The cost of that choice is listed under Consequences.

Design details:

- **One pipeline for chat and evals**: the turn logic moved out of the `useChatEngine` hook into `runAssistantTurn`. The eval runner calls the same function, so a score measures the real code path, not a copy of it.
- **Dev-only by construction, checked in CI**:
  - `runAssistantTurn` depends on a `TurnTracer` interface through `import type`, which erases at compile time.
  - Every call is `tracer?.…`, so its arguments are not even built in production.
  - `llm/tracing.ts` is the only runtime import of `webllm-otel`, behind an `import.meta.env.DEV` dynamic import.
  - A `strip-dev-bus-in-production` Vite plugin swaps the dev bus for an empty stand-in.
  - The toolbar apps register only when Astro runs `dev`.
  - `moon run app:assert-no-dev-code` scans `dist/` for planted markers on the build, preview and live deploy workflows. One marker was proven to catch an ungated `EvalBridge`.
- **Trace shape**:
  - One trace per turn.
  - Each agent (`router`, `chart`, `narrator`) owns a step span, and the model call nests under it. A model call that returns unparseable JSON is `ok`, and its `router` step is `error` with `error.type = parse`.
  - Errors live on the step that decided them.
  - The root ends after the narrator stream, so its duration is what the user waited for.
  - Model loads are spans. A conversation or an eval run is one Langfuse session, and `deployment.environment.name` separates `dev` from `eval`.
- **WebLLM's own timings**: WebLLM's `usage.extra` provides time to first token, prefill and decode rates. These are mapped onto the model-call span. No generic instrumentation can offer that.
- **Export through a dev proxy**:
  - The browser posts to `/__langfuse/v1/traces`. A Vite middleware (`apply: 'serve'`, so it never exists in a build) attaches the Basic-auth header.
  - The Langfuse keys are deliberately not `PUBLIC_`-prefixed, so Astro never inlines them into client code.
  - Without the keys, the proxy answers 501 and the export button is disabled.
- **Redaction at the credential boundary, as an allow-list**:
  - For any non-local Langfuse host, the proxy keeps only attributes listed in `EXPORTABLE_KEYS` and drops every status message, since DuckDB errors echo values.
  - Prompts, completions, the question and the SQL stay on the machine.
  - Because this runs in the proxy, no caller can opt out. `LANGFUSE_EXPORT_CONTENT=true` is an explicit override for synthetic data.
  - An allow-list was chosen over a deny-list because a deny-list fails open the moment an attribute is renamed or added.
- **Backend specifics at the edge**: Langfuse-only keys (tags, filterable metadata, observation level) are added at export time in `langfuseFlavour.ts`, never by the pipeline or the library.
- **Export only unsent spans**: Langfuse does not de-duplicate re-sent spans, so re-exporting the buffer doubled every count. The toolbar sends only spans that have ended and were not sent before.
- **Evals**:
  - 24 golden cases run against the demo dataset.
  - Each case gets seven independent deterministic checks, from `intentMatch` to `narratorOk`.
  - The history panel refuses to compare two runs whose model, chart mode, narrative mode or dataset differ, and says why.
- **Extractable package**:
  - `webllm-otel` has no Tracksy imports, and lint rules ban `window`, `localStorage` and `import.meta` in it.
  - A CI job copies it out of the repo, installs it with `--ignore-workspace`, builds and tests it, then imports `dist/` from plain Node. That catches ESM and `exports`-map bugs the test suite, which runs against `src/`, cannot.
- **pnpm workspace**: consuming the package turned the repo into a pnpm workspace (`app` and `packages/*`; `e2e` stays out on purpose). The CVE `overrides` moved to the root, because pnpm reads them only from there.

### Consequences

* Good, because every turn shows per-step timings, tokens, time to first token and WebLLM decode speed
* Good, because failures are classified by `error.type` on the step that failed, which feeds a Langfuse health dashboard (failure causes, degradations, latency per step, decode speed per model)
* Good, because a prompt change can be checked against 24 cases on the real pipeline
* Good, because none of it ships to users, and that is enforced by a CI check rather than a convention
* Good, because no prompt, question, SQL or error message reaches Langfuse Cloud by default
* Bad, because `webllm-otel` is a hand-written subset of the OpenTelemetry SDK, so status, array and event semantics are kept spec-correct by hand. It already drifts:
  * it emits the deprecated `gen_ai.system`, `gen_ai.prompt` and `gen_ai.completion`
  * it sets status `OK`, which the trace API says instrumentation libraries should not
  * it captures content by default, where the GenAI conventions make it opt-in
* Bad, because evals run once per case at temperature 0.1 to 0.3, so a single regressed case can be noise
* Bad, because WebLLM's `prompt_tokens` counts only newly prefilled tokens when the KV cache is reused (about 3,000 on the first router call, about 16 on later ones), so input tokens cannot be read as prompt size or cost
* Bad, because the workspace migration grew the change: root lockfile, moved overrides, and a CI step that needs `PROTO_PNPM_VERSION` because it runs outside moon
* Lesson learned: instrument where a failure is decided, not where it propagates. The first version recorded the chart fallback only when the engine call rejected, while the common case, a model returning bad JSON, was caught inside `askChartConfig` and stayed invisible.
* Lesson learned: test instrumentation with a fake engine that returns garbage, not by mocking the function being observed. Mocking confirmed the design but not the behaviour.
* Lesson learned: invariants enforced by code (the assert script, typed stand-ins, lint rules) held. Several written only in comments were wrong before the branch was merged.

Known follow-ups:

- Move to the current GenAI conventions: `gen_ai.provider.name`, `gen_ai.input.messages` and `gen_ai.output.messages`, content capture off by default, status left unset, and a pinned `schemaUrl`
- Re-evaluate rebasing `webllm-otel` on `@opentelemetry/api`, which would remove most of the hand-written SDK
- Control eval variance (temperature 0 with a fixed seed, or N runs per case) and record a prompt version in each run
- Record the WebGPU adapter as a resource attribute, since it is the main factor in on-device speed
- Spike headless evals in CI with Playwright. WebGPU on hosted runners is the open question.
- Any production signal, even a privacy-preserving one such as a "download diagnostics" button, is a maintainer decision and is out of scope here

## More Information

- [PR #652 — LLM observability and evals (dev only)](https://github.com/Gudsfile/tracksy/pull/652)
- [ADR: In-Browser AI Assistant with WebLLM and Text-to-SQL](../in-browser-ai-assistant/)
- `app/docs/llm-observability.md` — reading traces, the Langfuse dashboard, running evals, what leaves the machine
- `packages/webllm-otel/README.md`
- [OpenTelemetry GenAI semantic conventions](https://github.com/open-telemetry/semantic-conventions-genai)
- [Langfuse OpenTelemetry integration](https://langfuse.com/integrations/native/opentelemetry)
