import { GEN_AI } from 'webllm-otel'
import type { OtlpTracesPayload } from 'webllm-otel'

/**
 * Export-time content stripping for the Langfuse OTLP proxy.
 *
 * `askNarrator` embeds a sample of the user's listening history directly in its
 * prompt, and the tracer captures `gen_ai.prompt` / `gen_ai.completion` by
 * design — a failing eval case that doesn't show what the model saw is
 * useless. That is fine for the local trace view, but once a target is remote
 * (Langfuse Cloud), that content would leave the machine. This strips exactly
 * those two attributes from every span, leaving model id, token counts,
 * durations, statuses, error kinds, the `tracksy.*` attributes and the span
 * tree itself untouched — the shape of a turn stays visible, the content of it
 * does not.
 *
 * Runs inline in the dev proxy's request path (`astro.config.mjs`), so a bug
 * here must cost an export, not the dev server: any payload shape this
 * function does not recognize is passed through unchanged rather than thrown
 * on.
 */

const STRIPPED_KEYS: Set<string> = new Set([GEN_AI.PROMPT, GEN_AI.COMPLETION])

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
                                        !STRIPPED_KEYS.has(attribute?.key)
                                ),
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
