import {
    GEN_AI,
    GEN_AI_OPERATION_CHAT,
    GEN_AI_SYSTEM_WEBLLM,
    WEBLLM_OTEL,
} from './semconv.js'
import type { Run, SpanHandle } from './tracer.js'
import type { AttributeInput } from './types.js'

/**
 * The shape this library needs from an engine.
 *
 * Deliberately structural rather than `MLCEngineInterface`: `@mlc-ai/web-llm` is
 * an optional peer dependency, and requiring its types to compile would make it
 * mandatory in practice. Anything OpenAI-shaped satisfies this.
 */
export type EngineLike = {
    chat: {
        completions: {
            create: (...args: never[]) => unknown
        }
    }
}

type UsageLike = {
    /**
     * WebLLM counts only the newly prefilled tokens here when it detects a
     * multi-round conversation and reuses its KV cache, so this can be far
     * smaller than the prompt. Recorded as reported, never "corrected".
     */
    prompt_tokens?: number | null
    completion_tokens?: number | null
    /** WebLLM-specific measurements; absent on other engines. */
    extra?: {
        time_to_first_token_s?: number | null
        prefill_tokens_per_s?: number | null
        decode_tokens_per_s?: number | null
        time_per_output_token_s?: number | null
        e2e_latency_s?: number | null
    } | null
}

type ChoiceLike = {
    message?: { content?: string | null } | null
    delta?: { content?: string | null } | null
    finish_reason?: string | null
}

type CompletionLike = {
    id?: string | null
    model?: string | null
    usage?: UsageLike | null
    choices?: ChoiceLike[] | null
}

type RequestLike = {
    messages?: unknown
    model?: string | null
    temperature?: number | null
    max_tokens?: number | null
    stream?: boolean | null
}

export type WithTracingOptions = {
    /** The caller's span kind, e.g. `'router'`. */
    kind: string
    /**
     * Span name. Defaults to `chat {model}`, the GenAI convention, or `chat`
     * when no model is known.
     */
    name?: string
    /**
     * The model the engine has loaded. WebLLM requests rarely name a model, so
     * without this `gen_ai.request.model` would be missing on every span.
     */
    model?: string
    /**
     * Nests each completion span under this span instead of the run's root, so
     * an application step (a router, a retry) can own the model calls it makes.
     */
    parentSpanId?: string
    /** Extra attributes applied to every span this wrapper opens. */
    attributes?: AttributeInput
}

function isAsyncIterable(value: unknown): value is AsyncIterable<unknown> {
    return (
        typeof value === 'object' &&
        value !== null &&
        Symbol.asyncIterator in value
    )
}

function serializeMessages(messages: unknown): string | undefined {
    if (messages === undefined) return undefined
    try {
        return JSON.stringify(messages)
    } catch {
        // Circular or otherwise unserializable input is the caller's problem to
        // notice, not a reason to fail their inference call.
        return undefined
    }
}

function recordRequest(
    span: SpanHandle,
    request: RequestLike,
    captureContent: boolean,
    loadedModel: string | undefined
): void {
    span.setAttributes({
        [GEN_AI.SYSTEM]: GEN_AI_SYSTEM_WEBLLM,
        [GEN_AI.OPERATION_NAME]: GEN_AI_OPERATION_CHAT,
        [GEN_AI.REQUEST_MODEL]: request.model ?? loadedModel,
        [GEN_AI.REQUEST_STREAM]: request.stream === true ? true : undefined,
        [GEN_AI.REQUEST_TEMPERATURE]: request.temperature ?? undefined,
        [GEN_AI.REQUEST_MAX_TOKENS]: request.max_tokens ?? undefined,
        [GEN_AI.PROMPT]: captureContent
            ? serializeMessages(request.messages)
            : undefined,
    })
}

function recordUsage(span: SpanHandle, completion: CompletionLike): void {
    const finishReason = completion.choices?.[0]?.finish_reason
    const extra = completion.usage?.extra
    span.setAttributes({
        [GEN_AI.RESPONSE_ID]: completion.id ?? undefined,
        [GEN_AI.RESPONSE_MODEL]: completion.model ?? undefined,
        [GEN_AI.USAGE_INPUT_TOKENS]:
            completion.usage?.prompt_tokens ?? undefined,
        [GEN_AI.USAGE_OUTPUT_TOKENS]:
            completion.usage?.completion_tokens ?? undefined,
        [GEN_AI.RESPONSE_FINISH_REASONS]: finishReason
            ? [finishReason]
            : undefined,
        // WebLLM measures these itself. They are the one signal an
        // engine-specific instrumentation can offer that a generic one cannot,
        // and time-to-first-token is the latency a user actually perceives.
        [GEN_AI.RESPONSE_TIME_TO_FIRST_CHUNK]:
            extra?.time_to_first_token_s ?? undefined,
        [WEBLLM_OTEL.PREFILL_TOKENS_PER_S]:
            extra?.prefill_tokens_per_s ?? undefined,
        [WEBLLM_OTEL.DECODE_TOKENS_PER_S]:
            extra?.decode_tokens_per_s ?? undefined,
        [WEBLLM_OTEL.TIME_PER_OUTPUT_TOKEN_S]:
            extra?.time_per_output_token_s ?? undefined,
        [WEBLLM_OTEL.E2E_LATENCY_S]: extra?.e2e_latency_s ?? undefined,
    })
}

function toSpanError(cause: unknown): { message: string } {
    return {
        message: cause instanceof Error ? cause.message : String(cause),
    }
}

/**
 * Consumes a streamed completion, recording it as one span.
 *
 * Chunks are passed straight through, so the caller's streaming behaviour is
 * unchanged. Two details matter:
 *
 * - Usage is *assigned* from whichever chunk carries it, never accumulated.
 *   Providers report cumulative totals on the final chunk, so summing per chunk
 *   inflates the count — a mistake that is easy to make and invisible until the
 *   numbers are compared against something authoritative.
 * - The span closes in `finally`, so abandoning the iterator early (a `break`,
 *   or an aborted request) still produces a closed span rather than one that
 *   hangs open forever.
 */
async function* traceStream(
    stream: AsyncIterable<unknown>,
    span: SpanHandle,
    captureContent: boolean
): AsyncGenerator<unknown> {
    let completion = ''
    let lastUsage: UsageLike | null | undefined
    let id: string | null | undefined
    let model: string | null | undefined
    let finishReason: string | null | undefined
    let failure: unknown
    let failed = false

    try {
        for await (const chunk of stream) {
            const typed = chunk as CompletionLike
            if (typed.usage) lastUsage = typed.usage
            if (typed.model) model = typed.model
            if (typed.id) id = typed.id
            const choice = typed.choices?.[0]
            if (choice?.finish_reason) finishReason = choice.finish_reason
            const delta = choice?.delta?.content
            if (captureContent && typeof delta === 'string') {
                completion += delta
            }
            yield chunk
        }
    } catch (cause) {
        failed = true
        failure = cause
        throw cause
    } finally {
        recordUsage(span, {
            id,
            model,
            usage: lastUsage,
            choices: finishReason ? [{ finish_reason: finishReason }] : null,
        })
        span.setAttributes({
            [WEBLLM_OTEL.STREAMED]: true,
            [GEN_AI.COMPLETION]:
                captureContent && completion.length > 0
                    ? completion
                    : undefined,
        })
        span.end(failed ? { error: toSpanError(failure) } : undefined)
    }
}

/**
 * Wraps an engine so every `chat.completions.create` becomes a span on `run`.
 *
 * The returned object is a transparent proxy: it behaves exactly like the engine
 * it wraps, so it can be handed to code that has no idea tracing exists. Bind a
 * separate wrapper per logical caller — `withTracing(engine, run, { kind:
 * 'router' })`, `{ kind: 'narrator' }` — so spans are attributable without any
 * ambient state, which matters because callbacks may run long after the call
 * that created them.
 *
 * Returns the engine untouched when the run is disabled, or when it does not
 * expose `chat.completions.create` — instrumentation must never be the reason an
 * application breaks, so an unexpected shape degrades to no tracing rather than
 * throwing from inside the wrapper.
 */
export function withTracing<E extends EngineLike>(
    engine: E,
    run: Run,
    options: WithTracingOptions
): E {
    const originalCreate = engine?.chat?.completions?.create
    if (!run.enabled || typeof originalCreate !== 'function') return engine

    const { kind, model, parentSpanId, attributes } = options
    const captureContent = run.captureContent

    const tracedCreate = (...args: never[]): unknown => {
        const request = (args[0] ?? {}) as RequestLike
        const requestModel = request.model ?? model
        const span = run.startSpan({
            name:
                options.name ??
                (requestModel
                    ? `${GEN_AI_OPERATION_CHAT} ${requestModel}`
                    : GEN_AI_OPERATION_CHAT),
            kind,
            ...(parentSpanId && { parentSpanId }),
            attributes: { ...attributes, [WEBLLM_OTEL.SPAN_KIND]: kind },
        })
        recordRequest(span, request, captureContent, model)

        let result: unknown
        try {
            result = Reflect.apply(
                originalCreate,
                engine.chat.completions,
                args
            )
        } catch (cause) {
            // A synchronous throw — a bad argument, an engine in a bad state.
            span.end({ error: toSpanError(cause) })
            throw cause
        }

        if (isAsyncIterable(result)) {
            return traceStream(result, span, captureContent)
        }

        if (!(result instanceof Promise)) {
            span.end()
            return result
        }

        return result.then(
            (value: unknown) => {
                // A promise can still resolve to a stream, depending on how the
                // engine implements `stream: true`.
                if (isAsyncIterable(value)) {
                    return traceStream(value, span, captureContent)
                }
                const completion = value as CompletionLike
                recordUsage(span, completion)
                const content = completion.choices?.[0]?.message?.content
                span.setAttributes({
                    [GEN_AI.COMPLETION]:
                        captureContent && typeof content === 'string'
                            ? content
                            : undefined,
                })
                span.end()
                return value
            },
            (cause: unknown) => {
                span.end({ error: toSpanError(cause) })
                throw cause
            }
        )
    }

    const tracedCompletions = new Proxy(engine.chat.completions, {
        get(target, property, receiver) {
            if (property === 'create') return tracedCreate
            return Reflect.get(target, property, receiver)
        },
    })

    const tracedChat = new Proxy(engine.chat, {
        get(target, property, receiver) {
            if (property === 'completions') return tracedCompletions
            return Reflect.get(target, property, receiver)
        },
    })

    // Methods are bound to the real engine rather than left to receive the proxy
    // as `this`. Engines are class instances and may use private fields, which
    // throw when accessed through a proxy receiver.
    const boundMethods = new Map<PropertyKey, unknown>()

    return new Proxy(engine, {
        get(target, property, receiver) {
            if (property === 'chat') return tracedChat
            const value = Reflect.get(target, property, receiver)
            if (typeof value !== 'function') return value
            const cached = boundMethods.get(property)
            if (cached) return cached
            const bound = (value as (...args: never[]) => unknown).bind(target)
            boundMethods.set(property, bound)
            return bound
        },
    })
}
