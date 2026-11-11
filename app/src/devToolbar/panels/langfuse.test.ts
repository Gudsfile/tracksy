import { describe, it, expect, vi } from 'vitest'
import type { Span } from 'webllm-otel'
import { exportSpansToLangfuse, fetchLangfuseStatus } from './langfuse'

function span(overrides: Partial<Span> = {}): Span {
    return {
        traceId: 'a'.repeat(32),
        spanId: 'b'.repeat(16),
        name: 'chat.completions.create',
        kind: 'router',
        startTimeUnixNano: '1700000000000000000',
        endTimeUnixNano: '1700000000500000000',
        durationMs: 500,
        status: 'ok',
        attributes: { 'gen_ai.system': 'webllm' },
        ...overrides,
    }
}

function respond(body: unknown, init: ResponseInit = {}) {
    return new Response(JSON.stringify(body), {
        headers: { 'content-type': 'application/json' },
        ...init,
    })
}

describe('fetchLangfuseStatus', () => {
    it('reports configured with the host to display', async () => {
        const doFetch = vi
            .fn()
            .mockResolvedValue(
                respond({ configured: true, baseUrl: 'http://localhost:3000' })
            )

        await expect(fetchLangfuseStatus(doFetch)).resolves.toEqual({
            configured: true,
            baseUrl: 'http://localhost:3000',
        })
        expect(doFetch).toHaveBeenCalledWith('/__langfuse/status')
    })

    it('reports unconfigured rather than throwing when the proxy is absent', async () => {
        // The normal state in a dev server started without the env vars: the
        // toolbar should show a disabled button, not an error.
        const doFetch = vi.fn().mockRejectedValue(new Error('Failed to fetch'))

        await expect(fetchLangfuseStatus(doFetch)).resolves.toEqual({
            configured: false,
        })
    })

    it('treats a non-2xx status as unconfigured', async () => {
        const doFetch = vi
            .fn()
            .mockResolvedValue(new Response(null, { status: 404 }))

        await expect(fetchLangfuseStatus(doFetch)).resolves.toEqual({
            configured: false,
        })
    })

    it('does not trust a malformed body', async () => {
        const doFetch = vi.fn().mockResolvedValue(respond('nonsense'))

        await expect(fetchLangfuseStatus(doFetch)).resolves.toEqual({
            configured: false,
        })
    })
})

describe('exportSpansToLangfuse', () => {
    it('posts OTLP JSON to the proxy, never to Langfuse directly', async () => {
        const doFetch = vi
            .fn()
            .mockResolvedValue(new Response(null, { status: 202 }))

        await expect(exportSpansToLangfuse([span()], doFetch)).resolves.toEqual(
            {
                ok: true,
                spanCount: 1,
            }
        )

        const [url, init] = doFetch.mock.calls[0] as [string, RequestInit]
        // Same-origin only: the secret key lives in the dev server.
        expect(url).toBe('/__langfuse/v1/traces')
        expect(url).not.toContain('langfuse.com')
        const body = JSON.parse(init.body as string)
        expect(body.resourceSpans[0].scopeSpans[0].spans).toHaveLength(1)
        expect(body.resourceSpans[0].resource.attributes).toContainEqual({
            key: 'service.name',
            value: { stringValue: 'tracksy' },
        })
    })

    it('refuses an empty export instead of sending an empty payload', async () => {
        const doFetch = vi.fn()

        await expect(exportSpansToLangfuse([], doFetch)).resolves.toEqual({
            ok: false,
            error: 'Nothing to export yet.',
        })
        expect(doFetch).not.toHaveBeenCalled()
    })

    it('surfaces the proxy explanation when export is not configured', async () => {
        const doFetch = vi.fn().mockResolvedValue(
            new Response('{"error":"Langfuse export is not configured."}', {
                status: 501,
                statusText: 'Not Implemented',
            })
        )

        const outcome = await exportSpansToLangfuse([span()], doFetch)

        expect(outcome.ok).toBe(false)
        expect(outcome).toMatchObject({
            error: expect.stringContaining('not configured'),
        })
    })

    it('never throws, so a failed export cannot break the toolbar', async () => {
        const doFetch = vi.fn().mockRejectedValue(new Error('network down'))

        await expect(exportSpansToLangfuse([span()], doFetch)).resolves.toEqual(
            { ok: false, error: 'network down' }
        )
    })
})
