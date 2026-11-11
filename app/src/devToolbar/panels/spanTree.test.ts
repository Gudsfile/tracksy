import { describe, it, expect } from 'vitest'
import type { Span } from 'webllm-otel'
import {
    formatDuration,
    groupByTrace,
    renderTrace,
    renderTraceHeader,
} from './spanTree'

function span(overrides: Partial<Span> = {}): Span {
    return {
        traceId: 'a'.repeat(32),
        spanId: 'b'.repeat(16),
        name: 'step',
        kind: 'duckdb',
        startTimeUnixNano: '1700000000000000000',
        endTimeUnixNano: '1700000000001000000',
        durationMs: 1,
        status: 'ok',
        attributes: {},
        ...overrides,
    }
}

describe('formatDuration', () => {
    it('marks an unfinished span rather than showing a misleading zero', () => {
        expect(formatDuration(undefined)).toBe('…')
    })

    it('scales the unit to the magnitude', () => {
        expect(formatDuration(0.4)).toBe('<1ms')
        expect(formatDuration(42.6)).toBe('43ms')
        expect(formatDuration(2500)).toBe('2.50s')
    })
})

describe('groupByTrace', () => {
    it('groups spans by trace id, preserving first-seen order', () => {
        const traces = groupByTrace([
            span({ traceId: 'x', spanId: '1' }),
            span({ traceId: 'y', spanId: '2' }),
            span({ traceId: 'x', spanId: '3' }),
        ])

        expect([...traces.keys()]).toEqual(['x', 'y'])
        expect(traces.get('x')).toHaveLength(2)
    })
})

describe('renderTrace', () => {
    it('nests a child under its parent', () => {
        const html = renderTrace([
            span({ spanId: 'root', name: 'turn', kind: 'turn' }),
            span({ spanId: 'child', parentSpanId: 'root', name: 'query' }),
        ])

        expect(html).toContain('turn')
        expect(html).toContain('query')
        // The child renders one level deeper.
        expect(html).toContain('--depth:1')
    })

    it('renders an orphan at the root rather than dropping it', () => {
        // Spans arrive children-first, so a child can show up before its parent
        // — or the parent may never arrive for an in-flight turn. Losing it
        // would hide exactly the step you are trying to debug.
        const html = renderTrace([
            span({ spanId: 'child', parentSpanId: 'missing', name: 'orphan' }),
        ])

        expect(html).toContain('orphan')
        expect(html).toContain('--depth:0')
    })

    it('renders nothing for no spans', () => {
        expect(renderTrace([])).toBe('')
    })

    it('marks each status distinctly', () => {
        const html = renderTrace([
            span({ spanId: '1', status: 'ok' }),
            span({ spanId: '2', status: 'error' }),
            span({ spanId: '3', status: 'skipped' }),
            span({ spanId: '4', status: undefined, durationMs: undefined }),
        ])

        expect(html).toContain('dot-ok')
        expect(html).toContain('dot-error')
        expect(html).toContain('dot-skipped')
        // An unfinished span must not read as successful.
        expect(html).toContain('dot-pending')
        expect(html).toContain('running')
    })

    it('shows the error message and its kind', () => {
        const html = renderTrace([
            span({
                status: 'error',
                error: { kind: 'schema', message: 'missing sql field' },
            }),
        ])

        expect(html).toContain('schema')
        expect(html).toContain('missing sql field')
    })

    it('renders prompt and completion as their own blocks', () => {
        const html = renderTrace([
            span({
                kind: 'router',
                attributes: {
                    'gen_ai.prompt': '[{"role":"user"}]',
                    'gen_ai.completion': '{"intent":"top_artists"}',
                    'gen_ai.usage.output_tokens': 40,
                },
            }),
        ])

        expect(html).toContain('content-block')
        expect(html).toContain('top_artists')
        // Token counts stay in the key/value list.
        expect(html).toContain('gen_ai.usage.output_tokens')
    })

    it('hides attributes that are constant for every span', () => {
        const html = renderTrace([
            span({ attributes: { 'gen_ai.system': 'webllm' } }),
        ])

        expect(html).not.toContain('gen_ai.system')
        expect(html).toContain('No attributes.')
    })

    it('escapes model-authored content', () => {
        // The whole reason escapeHtml is mandatory here: this text comes from a
        // model, and it lands in innerHTML.
        const html = renderTrace([
            span({
                name: '<script>alert(1)</script>',
                attributes: {
                    'gen_ai.completion': '<img src=x onerror=alert(1)>',
                    'tracksy.sql': `" onmouseover="alert(1)`,
                },
            }),
        ])

        expect(html).not.toContain('<script>')
        expect(html).not.toContain('<img src=x')
        expect(html).not.toContain('" onmouseover="')
        expect(html).toContain('&lt;script&gt;')
        expect(html).toContain('&lt;img src=x')
    })
})

describe('renderTraceHeader', () => {
    it('labels the trace with the question', () => {
        const html = renderTraceHeader([
            span({
                name: 'assistant-turn',
                kind: 'turn',
                durationMs: 1234,
                attributes: { 'tracksy.question': 'top artists in 2024' },
            }),
            span({ spanId: 'child', parentSpanId: 'b'.repeat(16) }),
        ])

        expect(html).toContain('top artists in 2024')
        expect(html).toContain('2 spans')
        expect(html).toContain('1.23s')
    })

    it('falls back to the span name when there is no question', () => {
        expect(renderTraceHeader([span({ name: 'assistant-turn' })])).toContain(
            'assistant-turn'
        )
    })

    it('escapes the question', () => {
        const html = renderTraceHeader([
            span({ attributes: { 'tracksy.question': '<b>hi</b>' } }),
        ])

        expect(html).not.toContain('<b>hi</b>')
        expect(html).toContain('&lt;b&gt;hi&lt;/b&gt;')
    })

    it('renders nothing for no spans', () => {
        expect(renderTraceHeader([])).toBe('')
    })
})
