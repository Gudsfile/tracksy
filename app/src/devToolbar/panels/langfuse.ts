import type { Span } from 'webllm-otel'
import { exportOtlp, spansToOtlpTraces } from 'webllm-otel'

/**
 * Client half of the optional Langfuse export.
 *
 * Only ever talks to the same-origin dev proxy (`astro.config.mjs`), never to
 * Langfuse directly: the OTLP endpoint needs Basic auth built from the secret
 * key, and putting that in the browser is the one thing this design refuses to
 * do. The proxy owns the credential.
 */

const BASE = '/__langfuse'

export type LangfuseStatus = {
    configured: boolean
    baseUrl?: string
    /** Whether the configured host is anything other than local. */
    remote?: boolean
    /** Whether `gen_ai.prompt`/`gen_ai.completion` are stripped at export. */
    contentStripped?: boolean
}

/**
 * Asks the proxy whether export is available.
 *
 * Reports unconfigured rather than throwing when the proxy is absent — that is
 * the normal state in a dev server started without the environment variables,
 * and the toolbar should show a disabled button, not an error.
 */
export async function fetchLangfuseStatus(
    doFetch: typeof globalThis.fetch = globalThis.fetch
): Promise<LangfuseStatus> {
    try {
        const response = await doFetch(`${BASE}/status`)
        if (!response.ok) return { configured: false }
        const body: unknown = await response.json()
        if (typeof body !== 'object' || body === null) {
            return { configured: false }
        }
        const status = body as LangfuseStatus
        return {
            configured: status.configured === true,
            ...(status.baseUrl ? { baseUrl: status.baseUrl } : {}),
            ...(typeof status.remote === 'boolean'
                ? { remote: status.remote }
                : {}),
            ...(typeof status.contentStripped === 'boolean'
                ? { contentStripped: status.contentStripped }
                : {}),
        }
    } catch {
        return { configured: false }
    }
}

export type ExportOutcome =
    { ok: true; spanCount: number } | { ok: false; error: string }

/** Sends spans to Langfuse through the proxy. Never throws. */
export async function exportSpansToLangfuse(
    spans: Span[],
    doFetch: typeof globalThis.fetch = globalThis.fetch
): Promise<ExportOutcome> {
    if (spans.length === 0) {
        return { ok: false, error: 'Nothing to export yet.' }
    }
    try {
        await exportOtlp(
            spansToOtlpTraces(spans, { 'service.name': 'tracksy' }),
            { url: `${BASE}/v1/traces`, fetch: doFetch }
        )
        return { ok: true, spanCount: spans.length }
    } catch (error) {
        return {
            ok: false,
            error: error instanceof Error ? error.message : String(error),
        }
    }
}
