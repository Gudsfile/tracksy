import { ERROR_TYPE, GEN_AI, WEBLLM_OTEL } from 'webllm-otel'
import type { OtlpTracesPayload } from 'webllm-otel'
import { OTEL_ATTR, TRACKSY_ATTR } from '../llm/tracingTypes'
import { LANGFUSE_EXPORTABLE_KEYS } from './panels/langfuseFlavour'

/**
 * Export-time content stripping for the Langfuse OTLP proxy.
 *
 * `askNarrator` embeds a sample of the user's listening history directly in its
 * prompt, and the tracer captures prompts, completions, the question and the
 * SQL by design — a failing eval case that doesn't show what the model saw is
 * useless. That is fine for the local trace view, but once a target is remote
 * (Langfuse Cloud), that content would leave the machine.
 *
 * So this is an **allow-list**: only the attribute keys below survive, and every
 * status message is dropped (DuckDB and parser errors can quote values). A key
 * nobody listed — a new content attribute, a renamed convention — is stripped
 * by default rather than leaked by default. What survives is the shape of a
 * turn: model, token counts, timings, statuses, error classes, intents.
 *
 * Runs inline in the dev proxy's request path (`astro.config.mjs`), so a bug
 * here must cost an export, not the dev server: any payload shape this
 * function does not recognize is passed through unchanged rather than thrown
 * on.
 */

export const EXPORTABLE_KEYS: ReadonlySet<string> = new Set([
    GEN_AI.SYSTEM,
    GEN_AI.OPERATION_NAME,
    GEN_AI.REQUEST_MODEL,
    GEN_AI.REQUEST_TEMPERATURE,
    GEN_AI.REQUEST_MAX_TOKENS,
    GEN_AI.REQUEST_STREAM,
    GEN_AI.RESPONSE_MODEL,
    GEN_AI.RESPONSE_ID,
    GEN_AI.RESPONSE_FINISH_REASONS,
    GEN_AI.RESPONSE_TIME_TO_FIRST_CHUNK,
    GEN_AI.USAGE_INPUT_TOKENS,
    GEN_AI.USAGE_OUTPUT_TOKENS,
    ...Object.values(WEBLLM_OTEL),
    ERROR_TYPE,
    ...Object.values(OTEL_ATTR),
    TRACKSY_ATTR.INTENT,
    TRACKSY_ATTR.SQL_REJECTION,
    TRACKSY_ATTR.ROW_COUNT,
    TRACKSY_ATTR.RETRIED,
    TRACKSY_ATTR.CHART_MODE,
    TRACKSY_ATTR.NARRATIVE_MODE,
    TRACKSY_ATTR.MODEL_ID,
    TRACKSY_ATTR.PAYLOAD_KIND,
    TRACKSY_ATTR.EVAL_CASE,
    TRACKSY_ATTR.CANCELLED,
    TRACKSY_ATTR.CHART_FALLBACK,
    TRACKSY_ATTR.CHART_FALLBACK_REASON,
    TRACKSY_ATTR.NARRATIVE_CHARS,
    TRACKSY_ATTR.ENGINE_REUSED,
    TRACKSY_ATTR.MODEL_LOAD_REASON,
    TRACKSY_ATTR.ERROR_TYPE,
    ...LANGFUSE_EXPORTABLE_KEYS,
])

export function redactSpanContent(
    payload: OtlpTracesPayload
): OtlpTracesPayload {
    if (
        typeof payload !== 'object' ||
        payload === null ||
        !Array.isArray(payload.resourceSpans)
    ) {
        return payload
    }

    return {
        ...payload,
        resourceSpans: payload.resourceSpans.map((resourceSpan) => {
            if (
                typeof resourceSpan !== 'object' ||
                resourceSpan === null ||
                !Array.isArray(resourceSpan.scopeSpans)
            ) {
                return resourceSpan
            }
            return {
                ...resourceSpan,
                scopeSpans: resourceSpan.scopeSpans.map((scopeSpan) => {
                    if (
                        typeof scopeSpan !== 'object' ||
                        scopeSpan === null ||
                        !Array.isArray(scopeSpan.spans)
                    ) {
                        return scopeSpan
                    }
                    return {
                        ...scopeSpan,
                        spans: scopeSpan.spans.map((span) => {
                            if (
                                typeof span !== 'object' ||
                                span === null ||
                                !Array.isArray(span.attributes)
                            ) {
                                return span
                            }
                            return {
                                ...span,
                                attributes: span.attributes.filter(
                                    (attribute) =>
                                        EXPORTABLE_KEYS.has(attribute?.key)
                                ),
                                ...(span.status && {
                                    status: { code: span.status.code },
                                }),
                            }
                        }),
                    }
                }),
            }
        }),
    }
}

/**
 * A Langfuse Cloud host is remote by definition — this classifies whether
 * *any* configured base URL is local, so the proxy can decide whether to
 * redact automatically.
 *
 * Kept alongside `redactSpanContent` because both exist for the same reason:
 * the proxy needs to know, without an account or a network call, whether the
 * export is about to leave the machine.
 */
const LOCAL_HOSTS = new Set([
    'localhost',
    '127.0.0.1',
    '::1',
    '[::1]',
    'host.docker.internal',
])

export function isRemoteHost(baseUrl: string): boolean {
    try {
        const { hostname } = new URL(baseUrl)
        return !LOCAL_HOSTS.has(hostname)
    } catch {
        // An unparsable URL isn't a known-local host — treat it as remote so
        // the safe default (strip) wins rather than a malformed setting
        // accidentally disabling redaction.
        return true
    }
}
