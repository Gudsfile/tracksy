---
date: 2026-11-09
draft: true
title: "In-Browser AI Assistant with WebLLM and Text-to-SQL"
---

## Context and Problem Statement

Tracksy's charts answer a fixed set of questions about a Spotify export. Users keep asking things the charts do not cover ("which artist did I stop listening to after 2021?"), and the natural interface for that is a chat box.

Tracksy is privacy-first: all processing happens in the browser, with no server-side storage and no external API call carrying user data. The Chat tab therefore has to answer questions about the user's listening history without that history ever leaving the device. A secondary goal is to keep the project free to run: no API key, no backend, no per-request cost, and a feature that keeps working offline once set up.

Constraints that shape the design:

- The data already lives in an in-memory DuckDB WASM database, so the assistant should query it rather than reason over raw rows.
- The model must run on a user's laptop or phone, so it is small (hundreds of MB to about 1 GB) and unreliable compared with a hosted model.
- The app ships as a static site, so the model runtime must not bloat the initial bundle.

## Considered Options

### Option 1: Hosted LLM API

Send the question, the schema and result rows to a hosted model.

**Pros:**

- Best answer quality, no download, works on any device

**Cons:**

- Listening data leaves the device, which contradicts the README and `SECURITY.md` promise
- Needs an API key, a proxy and a running cost

### Option 2: WebLLM, model picks an intent and routes to bespoke charts

The first implementation. The model returned one of a fixed catalogue of intents, and purpose-built components ran their own SQL.

**Pros:**

- Predictable, hand-tuned visuals per intent

**Cons:**

- The model's SQL, the chart's own query and the summary could disagree (review of PR #420)
- Every new question type needs a new intent and component

### Option 3: WebLLM, always generate SQL, execute once, share one result set

The model returns one JSON object (`intent`, `title`, `explanation`, `sql`). The SQL is validated, run once on DuckDB WASM, and that single result set feeds the chart, the narrator and the SQL accordion.

**Pros:**

- The chart, the narrative and the displayed SQL cannot diverge
- Open-ended questions are possible without a new intent per question

**Cons:**

- Correctness depends on a small model writing valid DuckDB SQL

### Option 4: Another in-browser runtime

[transformers.js](https://huggingface.co/docs/transformers.js/index) (ONNX Runtime Web), [wllama](https://github.com/ngxson/wllama) (llama.cpp compiled to WASM) or Chrome's built-in Prompt API (Gemini Nano). This comparison comes from general knowledge of these projects, not from a benchmark run for this decision.

**Pros:**

- transformers.js and wllama can fall back to CPU, so they reach devices without WebGPU
- The Prompt API needs no model download from the app

**Cons:**

- wllama on CPU is much slower, and its multi-threaded build needs cross-origin isolation headers that a static host may not provide
- transformers.js has no OpenAI-style API or built-in grammar-constrained decoding
- The Prompt API only works in Chrome, and limits model choice, sampling control and browser availability

## Decision Outcome

Chosen option: **Option 3 — WebLLM with text-to-SQL and a single shared result set**, because it is the only option that keeps user data on the device while keeping the answer, the chart and the SQL consistent.

WebLLM was preferred over the other in-browser runtimes because it is a mature WebGPU runtime with an OpenAI-style API, prebuilt Qwen2.5-Coder builds and XGrammar available for constrained decoding. The cost is accepted: WebGPU is required and there is no CPU fallback, so unsupported browsers see an "unavailable" state and the rest of the app is unaffected.

Design details:

- **Models**: Qwen2.5-Coder 1.5B (`q4f16_1`, about 1.6 GB VRAM) was picked as a coder-tuned model suited to text-to-SQL. The 0.5B sibling (about 0.9 GB VRAM) was added after the 1.5B ran out of GPU memory and reloaded the tab on Safari iOS (#377). Other model families were not benchmarked.
- **Presets**: `recommendPreset` picks one of rich, balanced, lite or minimal from `navigator.deviceMemory` and the WebGPU buffer limits, and the user can override it. The thresholds are deliberately loose, meant to steer away from out-of-memory crashes, and were not benchmarked. Safari and Firefox expose no `deviceMemory`, so on those browsers the choice rests on the WebGPU limits alone, or defaults to `balanced` when those are unavailable too.
- **Three agents, one model**: a SQL agent, a chart agent and a narrator share the loaded engine. The 0.5B model hallucinated prose, so the narrative and the model-driven chart are only enabled on the larger presets.
- **SQL safety**: a regex validator accepts only a single `SELECT` or `WITH`, rejects a 22-keyword deny-list, and enforces a table allowlist. It runs on the same in-memory DuckDB connection as the user data. This is a guardrail against hallucinated or data-steered SQL (a track name is untrusted text), not a security boundary, and the blast radius is the user's own in-memory data.
- **JSON output**: JSON is requested in the prompt at temperature 0.1 and parsed by hand. WebLLM's `response_format` with XGrammar is not adopted yet.
- **Threading**: the engine runs on the main thread through `CreateMLCEngine`, with no `WebWorkerMLCEngine`. This was an accepted simplicity trade-off and was not measured.
- **Loading**: the web-llm chunk is about 5.7 MB, so the Chat tab is lazy-loaded, the engine is imported only on "Enable assistant", and shared state lives in a web-llm-free module so it does not drag the chunk in. Weights and WASM come from Hugging Face and GitHub through WebLLM's defaults, and only after that explicit opt-in. The privacy promise covers user data, not zero network traffic.

### Consequences

* Good, because listening data never leaves the device and the feature needs no backend, key or running cost
* Good, because the chart, narrative and SQL come from one result set
* Good, because users can inspect the SQL and open it in the Query tab
* Good, because the 5.7 MB runtime only loads for users who opt in
* Bad, because the first use downloads about 1 GB, and the feature needs WebGPU
* Bad, because a 0.5B to 1.5B model is unreliable, so some questions produce wrong or empty SQL and the retry only fires once on a DuckDB error
* Bad, because the regex validator is not a parser (comma joins and table functions are not covered by the table check)
* Lesson learned: grounding a small model in the current date took four iterations ([`a5235c39`](https://github.com/Gudsfile/tracksy/commit/a5235c39a792169ebd8a7f22b9f74dd11b408d15), [`15900335`](https://github.com/Gudsfile/tracksy/commit/15900335a4b125038fc0f16fc4d8ae010696af8f), [`8882b2a5`](https://github.com/Gudsfile/tracksy/commit/8882b2a577793fe48a55a20e09660ee763039914), [`b3809089`](https://github.com/Gudsfile/tracksy/commit/b380908921da4e0516cdf1ad7781779d888afeff)). The model treated a date prefix as an instruction to filter by that year, so the final design resolves years client-side and adds the prefix only when the question names a year.

Known follow-ups:

- Check `shader-f16` support before offering the `q4f16` models, since neither declares it as a required feature
- Call `interruptGenerate()` on abort so a cancelled generation releases the engine lock
- Adopt XGrammar `response_format` to guarantee valid JSON
- Remove the `intent` field, which is parsed but no longer used since the routing design was dropped
- Add model-cache inspection and deletion in the settings panel

## More Information

- [WebLLM repository](https://github.com/mlc-ai/web-llm)
- [Issue #377 — Tab crash on Safari iOS](https://github.com/Gudsfile/tracksy/issues/377)
- [PR #420 — streaming NarratorAgent and SQL retry pipeline](https://github.com/Gudsfile/tracksy/pull/420), where the chart, SQL and summary inconsistencies surfaced
- Commits [`c3c8d5f5`](https://github.com/Gudsfile/tracksy/commit/c3c8d5f53e29af7598bd1e83ed30fbe54d7194eb) (single result set), [`0ce86883`](https://github.com/Gudsfile/tracksy/commit/0ce86883ca0eda144c9963122b2b132c77da2cbf) (lighter model on iOS), [`558db962`](https://github.com/Gudsfile/tracksy/commit/558db96206e6b3d52b0873ccd28a546868db78fd) (lazy-loaded tabs)
