import type { Span } from 'webllm-otel'
import { escapeHtml } from '../escapeHtml'

/**
 * Renders one trace as a collapsible span tree.
 *
 * The toolbar runs in its own module graph, so it cannot read the page's tracer
 * directly — importing it would construct a *second* tracer holding a different
 * set of runs. Instead it accumulates the spans that arrive on the dev bus and
 * reconstructs each trace from them, which is why this takes a flat span list
 * rather than a `RunRecord`.
 *
 * That also means spans arrive children-first: a child closes before its parent,
 * and the root closes last. Rendering therefore has to cope with a trace whose
 * root has not arrived yet.
 */

/** Attributes shown as their own block rather than in the key/value list. */
const CONTENT_ATTRIBUTES = ['gen_ai.prompt', 'gen_ai.completion'] as const

const HIDDEN_ATTRIBUTES = new Set<string>([
    'gen_ai.system',
    'gen_ai.operation.name',
    'webllm_otel.span.kind',
])

export function formatDuration(ms: number | undefined): string {
    if (ms === undefined) return '…'
    if (ms < 1) return '<1ms'
    if (ms < 1000) return `${Math.round(ms)}ms`
    return `${(ms / 1000).toFixed(2)}s`
}

function statusClass(span: Span): string {
    if (span.status === 'error') return 'error'
    if (span.status === 'skipped') return 'skipped'
    if (span.status === undefined) return 'pending'
    return 'ok'
}

function statusLabel(span: Span): string {
    return span.status ?? 'running'
}

/**
 * Groups spans into traces, newest trace last.
 *
 * Insertion order is the order spans first appeared, which keeps traces stable
 * in the UI as new spans stream in.
 */
export function groupByTrace(spans: Span[]): Map<string, Span[]> {
    const traces = new Map<string, Span[]>()
    for (const span of spans) {
        const existing = traces.get(span.traceId)
        if (existing) {
            existing.push(span)
        } else {
            traces.set(span.traceId, [span])
        }
    }
    return traces
}

function renderAttributes(span: Span): string {
    const entries = Object.entries(span.attributes).filter(
        ([key]) =>
            !HIDDEN_ATTRIBUTES.has(key) &&
            !(CONTENT_ATTRIBUTES as readonly string[]).includes(key)
    )

    const content = CONTENT_ATTRIBUTES.filter(
        (key) => typeof span.attributes[key] === 'string'
    )
        .map(
            (key) => `
        <div class="content-block">
          <div class="content-label">${escapeHtml(key.replace('gen_ai.', ''))}</div>
          <pre class="content-body">${escapeHtml(span.attributes[key])}</pre>
        </div>`
        )
        .join('')

    const pairs = entries
        .map(
            ([key, value]) => `
        <div class="attr">
          <span class="attr-key">${escapeHtml(key)}</span>
          <span class="attr-value">${escapeHtml(value)}</span>
        </div>`
        )
        .join('')

    const error = span.error
        ? `<div class="attr">
             <span class="attr-key">error${span.error.kind ? ` (${escapeHtml(span.error.kind)})` : ''}</span>
             <span class="attr-value attr-error">${escapeHtml(span.error.message)}</span>
           </div>`
        : ''

    if (!pairs && !content && !error) {
        return `<div class="empty">No attributes.</div>`
    }
    return `${error}${pairs}${content}`
}

function renderSpan(
    span: Span,
    childrenOf: Map<string, Span[]>,
    depth: number
): string {
    const children = childrenOf.get(span.spanId) ?? []
    const nested = children
        .map((child) => renderSpan(child, childrenOf, depth + 1))
        .join('')

    return `
      <details class="span" style="--depth:${depth}">
        <summary class="span-summary">
          <span class="dot dot-${statusClass(span)}" title="${escapeHtml(statusLabel(span))}"></span>
          <span class="span-kind">${escapeHtml(span.kind)}</span>
          <span class="span-name">${escapeHtml(span.name)}</span>
          <span class="span-duration">${escapeHtml(formatDuration(span.durationMs))}</span>
        </summary>
        <div class="span-body">${renderAttributes(span)}</div>
      </details>${nested}`
}

/**
 * Renders a single trace. `spans` must all share a `traceId`.
 *
 * Spans whose parent is absent from the list are rendered at the root, so an
 * in-flight or truncated trace still shows everything it has rather than
 * silently dropping orphans.
 */
export function renderTrace(spans: Span[]): string {
    if (spans.length === 0) return ''

    const byId = new Set(spans.map((span) => span.spanId))
    const childrenOf = new Map<string, Span[]>()
    const roots: Span[] = []

    for (const span of spans) {
        const parentId = span.parentSpanId
        if (parentId !== undefined && byId.has(parentId)) {
            const siblings = childrenOf.get(parentId)
            if (siblings) siblings.push(span)
            else childrenOf.set(parentId, [span])
        } else {
            roots.push(span)
        }
    }

    return roots.map((root) => renderSpan(root, childrenOf, 0)).join('')
}

/** A one-line header for a trace: its question, outcome and total duration. */
export function renderTraceHeader(spans: Span[]): string {
    const root =
        spans.find((span) => span.parentSpanId === undefined) ?? spans[0]
    if (!root) return ''

    const question = root.attributes['tracksy.question']
    const label =
        typeof question === 'string' && question.length > 0
            ? question
            : root.name

    return `
      <div class="trace-header">
        <span class="dot dot-${statusClass(root)}"></span>
        <span class="trace-question" title="${escapeHtml(label)}">${escapeHtml(label)}</span>
        <span class="trace-meta">${spans.length} span${spans.length === 1 ? '' : 's'}</span>
        <span class="trace-meta">${escapeHtml(formatDuration(root.durationMs))}</span>
      </div>`
}
