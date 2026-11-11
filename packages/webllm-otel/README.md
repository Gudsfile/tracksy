# webllm-otel

OpenTelemetry-shaped tracing for [`@mlc-ai/web-llm`](https://github.com/mlc-ai/web-llm).

WebLLM runs inference in the browser on WebGPU, which puts it outside the reach of
every server-side LLM observability integration. There is no Langfuse, OpenLLMetry,
or OpenTelemetry instrumentation for it — and the browser can't use the ones that
exist, because they need a secret key and a Node runtime.

This package fills that gap:

- **`withTracing(engine, tracer)`** — a transparent proxy over an `MLCEngineInterface`
  that captures every `chat.completions.create` call, streaming or not.
- **A span store** — runs and spans held in memory, so a devtools panel has something
  to render. Non-LLM steps can be spanned too.
- **OTLP/JSON export** — serialize to the OpenTelemetry wire format and POST it.
  Attributes follow the GenAI semantic conventions, so backends that understand them
  (Langfuse among others) map model, token usage, and prompt/completion natively with
  no translation.

No dependencies. Framework-agnostic: no DOM, no bundler globals, no storage.

## Status

Currently developed inside the [Tracksy](https://github.com/Gudsfile/tracksy) monorepo
and marked `private`. It is written to be extracted — nothing here imports from the
app — and will be published from its own repository once the API settles.

## Install

```sh
pnpm add webllm-otel
```

`@mlc-ai/web-llm` is an optional peer dependency, used for types only.

## Usage

```ts
import {
    createTracer,
    withTracing,
    toOtlpTraces,
    exportOtlp,
} from 'webllm-otel'

const tracer = createTracer({
    enabled: import.meta.env.DEV, // never trace in production
    onSpanEnd: (span) => console.debug(span.name, span.attributes),
})

const run = tracer.startRun({
    name: 'assistant-turn',
    attributes: { 'session.id': sessionId },
})

// Bind one wrapper per logical caller, so spans are attributable with no
// ambient state — which matters when a callback runs long after the call
// that created it.
const router = withTracing(engine, run, { kind: 'router' })

// Use `router` exactly as you would `engine` — every completion is now a span.
const completion = await router.chat.completions.create({ messages })

// Non-LLM steps join the same run:
run.startSpan({ name: 'validate-sql', kind: 'guardrail' }).end({ status: 'ok' })

// Streaming works too; chunks pass through untouched and the span closes when
// the stream ends — or when you stop consuming it.
const narrator = withTracing(engine, run, { kind: 'narrator' })
for await (const chunk of await narrator.chat.completions.create({
    messages,
    stream: true,
})) {
    render(chunk)
}

run.end()
```

Spans record failures too. A rejected or mid-stream-throwing completion is closed
with `status: 'error'` and the message, and the original error is rethrown
untouched — instrumentation never changes what your code sees.

### Exporting to a self-hosted Langfuse

Langfuse authenticates OTLP with **Basic auth built from the secret key**, which must
never reach the browser. Proxy it from your dev server and forward the header there:

```ts
await exportOtlp(toOtlpTraces(tracer.getRuns(), { 'service.name': 'my-app' }), {
    url: '/__langfuse/v1/traces',
    headers: { 'x-langfuse-ingestion-version': '4' },
})
```

Your proxy forwards to `<host>/api/public/otel/v1/traces` with
`Authorization: Basic base64(publicKey:secretKey)`. Because ids are generated in
OTLP form and attributes use the GenAI conventions, nothing is translated on the
way out — what the trace store holds is what the backend receives.

## Options

| Option           | Default | Purpose                                                       |
| ---------------- | ------- | ------------------------------------------------------------- |
| `enabled`        | `true`  | When false every handle is a no-op that allocates nothing.    |
| `maxRuns`        | `25`    | Ring buffer size; oldest runs are evicted.                    |
| `captureContent` | `true`  | When false, prompt and completion text is omitted from spans. |
| `onSpanEnd`      | —       | Called as each span closes. Bridge this to your own bus.      |
| `now`            | —       | Injectable clock, for deterministic tests.                    |

### `withTracing` options

| Option         | Purpose                                                                          |
| -------------- | -------------------------------------------------------------------------------- |
| `kind`         | Your label for the caller (`'router'`, `'narrator'`), recorded on every span.    |
| `model`        | The loaded model id. Sets `gen_ai.request.model` and names spans `chat {model}`. |
| `parentSpanId` | Nest every model call under one of your spans (a step) instead of the run root.  |

## What a model-call span records

- GenAI conventions: operation, request model / temperature / max tokens / stream,
  response id / model / finish reasons, input and output tokens,
  `gen_ai.response.time_to_first_chunk`.
- WebLLM's own measurements from `usage.extra`, under `webllm_otel.usage.*`:
  prefill and decode tokens/s, time per output token, end-to-end latency.
- Failures as `error.type` (your `kind`, or `_OTHER`) plus the OTLP status message.

**Streams report usage only when asked.** Pass
`stream_options: { include_usage: true }`; WebLLM then sends usage on the final
chunk, and every other chunk carries `usage: null`.

**`input_tokens` is not always the prompt size.** WebLLM counts only the newly
prefilled tokens when it detects a multi-round conversation and reuses its KV
cache. A 3,000-token prompt can report 16. The value is recorded as reported; do
not sum it into prompt cost.

## Licence

MIT
