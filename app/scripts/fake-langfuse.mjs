/**
 * Stands in for the Langfuse OTLP ingestion endpoint so the export path — dev
 * server → `langfuseProxy` → Basic auth → redaction → upstream — can be
 * checked in about a second, with no account and no network.
 *
 * Point `LANGFUSE_BASE_URL` at `http://localhost:3999` (any placeholder keys
 * work, this never checks them) and click *Send to Langfuse* in the Tracksy
 * LLM devtools panel. This proves the plumbing; it cannot show how Langfuse
 * *renders* a payload — for that, use a real Langfuse Cloud project (see
 * AGENTS.md).
 */

import { createServer } from 'node:http'

const PORT = 3999
const CONTENT_KEYS = new Set(['gen_ai.prompt', 'gen_ai.completion'])

function spanCount(payload) {
    if (!payload || !Array.isArray(payload.resourceSpans)) return 0
    return payload.resourceSpans.reduce(
        (total, resourceSpan) =>
            total +
            (resourceSpan.scopeSpans ?? []).reduce(
                (subtotal, scopeSpan) =>
                    subtotal + (scopeSpan.spans ?? []).length,
                0
            ),
        0
    )
}

function survivingContentAttributes(payload) {
    if (!payload || !Array.isArray(payload.resourceSpans)) return 0
    let count = 0
    for (const resourceSpan of payload.resourceSpans) {
        for (const scopeSpan of resourceSpan.scopeSpans ?? []) {
            for (const span of scopeSpan.spans ?? []) {
                for (const attribute of span.attributes ?? []) {
                    if (CONTENT_KEYS.has(attribute.key)) count += 1
                }
            }
        }
    }
    return count
}

const server = createServer((req, res) => {
    const chunks = []
    req.on('data', (chunk) => chunks.push(chunk))
    req.on('end', () => {
        const body = Buffer.concat(chunks).toString('utf8')

        console.log(`\n${req.method} ${req.url}`)
        console.log(
            `  authorization: ${req.headers.authorization ? 'present' : 'MISSING'}`
        )
        console.log(
            `  x-langfuse-ingestion-version: ${req.headers['x-langfuse-ingestion-version'] ?? 'MISSING'}`
        )

        if (req.url?.includes('/api/public/otel/v1/traces')) {
            let payload
            try {
                payload = JSON.parse(body)
            } catch {
                console.log('  body did not parse as JSON')
            }
            if (payload) {
                const surviving = survivingContentAttributes(payload)
                console.log(`  spans: ${spanCount(payload)}`)
                console.log(
                    `  surviving gen_ai.prompt/gen_ai.completion attributes: ${surviving}` +
                        (surviving === 0 ? ' (redacted)' : ' (NOT redacted)')
                )
            }
        }

        res.statusCode = 207
        res.setHeader('content-type', 'application/json')
        res.end(JSON.stringify({ successful: [], errors: [] }))
    })
})

server.listen(PORT, () => {
    console.log(
        `fake-langfuse listening on http://localhost:${PORT}\n` +
            'Set LANGFUSE_BASE_URL=http://localhost:3999 with any placeholder\n' +
            'LANGFUSE_PUBLIC_KEY / LANGFUSE_SECRET_KEY, restart the dev server, and\n' +
            'use "Send to Langfuse" in the Tracksy LLM devtools panel.\n' +
            'This only proves the plumbing — it cannot show how Langfuse renders\n' +
            'a payload. For that, use a real Langfuse Cloud project.'
    )
})
