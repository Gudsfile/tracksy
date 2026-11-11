/**
 * OpenTelemetry GenAI semantic-convention attribute keys.
 *
 * Using the standard names rather than inventing our own is the whole reason a
 * backend can make sense of these spans without a translation layer: Langfuse,
 * for one, maps `gen_ai.*` straight onto its model, token-usage, and
 * input/output fields.
 *
 * @see https://opentelemetry.io/docs/specs/semconv/gen-ai/gen-ai-spans/
 */
export const GEN_AI = {
    SYSTEM: 'gen_ai.system',
    OPERATION_NAME: 'gen_ai.operation.name',
    REQUEST_MODEL: 'gen_ai.request.model',
    REQUEST_TEMPERATURE: 'gen_ai.request.temperature',
    REQUEST_MAX_TOKENS: 'gen_ai.request.max_tokens',
    RESPONSE_MODEL: 'gen_ai.response.model',
    RESPONSE_FINISH_REASONS: 'gen_ai.response.finish_reasons',
    USAGE_INPUT_TOKENS: 'gen_ai.usage.input_tokens',
    USAGE_OUTPUT_TOKENS: 'gen_ai.usage.output_tokens',
    PROMPT: 'gen_ai.prompt',
    COMPLETION: 'gen_ai.completion',
} as const

/** Value for {@link GEN_AI.SYSTEM} identifying in-browser MLC/WebLLM inference. */
export const GEN_AI_SYSTEM_WEBLLM = 'webllm'

/** Value for {@link GEN_AI.OPERATION_NAME} for a chat completion. */
export const GEN_AI_OPERATION_CHAT = 'chat'

/**
 * This library's own keys, namespaced so they can never collide with a future
 * `gen_ai.*` addition.
 */
export const WEBLLM_OTEL = {
    /** The caller's span kind, carried through to the backend verbatim. */
    SPAN_KIND: 'webllm_otel.span.kind',
    /** Present and `true` when the completion was streamed. */
    STREAMED: 'webllm_otel.streamed',
    /** Classification from {@link SpanError.kind}, when the caller supplied one. */
    ERROR_KIND: 'webllm_otel.error.kind',
} as const
