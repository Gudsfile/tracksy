import { describe, it, expect, beforeEach, vi } from 'vitest'
import type { Span } from 'webllm-otel'
import app from './tracksyLlmToolbar'
import * as langfusePanel from './panels/langfuse'

const PREFIX = 'tracksy:dev:'

function span(overrides: Partial<Span> = {}): Span {
    return {
        traceId: 'a'.repeat(32),
        spanId: Math.random().toString(16).slice(2).padEnd(16, '0'),
        name: 'step',
        kind: 'duckdb',
        startTimeUnixNano: '1700000000000000000',
        endTimeUnixNano: '1700000000005000000',
        durationMs: 5,
        status: 'ok',
        attributes: {},
        ...overrides,
    }
}

/**
 * Mounts the toolbar app the way Astro does: a canvas element to render into,
 * plus an event target for placement updates.
 */
function mount() {
    const canvas = document.createElement('div')
    document.body.replaceChildren(canvas)
    const eventTarget = {
        onToolbarPlacementUpdated: vi.fn(),
        onAppToggled: vi.fn(),
    }
    app.init?.(
        canvas as never,
        eventTarget as never,
        { placement: 'bottom-center' } as never
    )
    return { canvas, eventTarget }
}

function emit(detail: { span: Span }): void {
    window.dispatchEvent(new CustomEvent(`${PREFIX}agent:span`, { detail }))
}

beforeEach(() => {
    document.body.replaceChildren()
})

describe('the Tracksy LLM toolbar app', () => {
    it('mounts a window and shows an empty state', () => {
        const { canvas } = mount()

        expect(canvas.querySelector('astro-dev-toolbar-window')).not.toBeNull()
        expect(canvas.textContent).toContain('No assistant turns yet')
    })

    it('keeps the window aligned with the toolbar', () => {
        const { eventTarget } = mount()

        expect(eventTarget.onToolbarPlacementUpdated).toHaveBeenCalled()
    })

    it('renders a trace as spans arrive on the bus', () => {
        const { canvas } = mount()

        emit({
            span: span({
                spanId: 'root'.padEnd(16, '0'),
                name: 'assistant-turn',
                kind: 'turn',
                attributes: { 'tracksy.question': 'top artists' },
            }),
        })
        emit({
            span: span({
                parentSpanId: 'root'.padEnd(16, '0'),
                kind: 'router',
                name: 'chat.completions.create',
            }),
        })

        expect(canvas.textContent).toContain('top artists')
        expect(canvas.textContent).toContain('router')
        expect(canvas.textContent).toContain('1 turn')
        expect(canvas.textContent).toContain('2 spans')
    })

    it('separates concurrent traces', () => {
        const { canvas } = mount()

        emit({ span: span({ traceId: 'a'.repeat(32) }) })
        emit({ span: span({ traceId: 'b'.repeat(32) }) })

        expect(canvas.querySelectorAll('.trace')).toHaveLength(2)
        expect(canvas.textContent).toContain('2 turns')
    })

    it('clears on demand', () => {
        const { canvas } = mount()
        emit({ span: span() })
        expect(canvas.textContent).not.toContain('No assistant turns yet')

        canvas
            .querySelector<HTMLButtonElement>('[data-action="clear"]')
            ?.click()

        expect(canvas.textContent).toContain('No assistant turns yet')
    })

    it('does not execute model-authored markup', () => {
        const { canvas } = mount()

        emit({
            span: span({
                kind: 'router',
                attributes: {
                    'gen_ai.completion': '<img src=x onerror="alert(1)">',
                },
            }),
        })

        // The payload must survive as visible text, and as nothing else.
        expect(canvas.querySelector('img')).toBeNull()
        expect(canvas.textContent).toContain('<img src=x onerror="alert(1)">')
    })

    it('shows a failing step distinctly', () => {
        const { canvas } = mount()

        emit({
            span: span({
                kind: 'sql-validate',
                status: 'error',
                error: { kind: 'unsafe-sql', message: 'DROP is not allowed' },
            }),
        })

        expect(canvas.querySelector('.dot-error')).not.toBeNull()
        expect(canvas.textContent).toContain('DROP is not allowed')
    })
})

function emitEvent<T>(type: string, detail: T): void {
    window.dispatchEvent(new CustomEvent(`${PREFIX}${type}`, { detail }))
}

function openEvals(canvas: HTMLElement): void {
    canvas.querySelector<HTMLButtonElement>('[data-tab="evals"]')?.click()
}

function caseResult(
    caseId: string,
    passed: boolean,
    extra: Record<string, unknown> = {}
) {
    return {
        caseId,
        passed,
        checks: {
            intentMatch: passed,
            paramsMatch: true,
            sqlValid: true,
            sqlExecuted: true,
            shapeOk: true,
            noRetry: true,
        },
        ...extra,
    }
}

describe('the Evals tab', () => {
    beforeEach(() => {
        localStorage.clear()
    })

    it('starts on Traces and switches on click', () => {
        const { canvas } = mount()
        expect(canvas.textContent).toContain('No assistant turns yet')

        openEvals(canvas)

        expect(canvas.textContent).toContain('No run yet')
        expect(
            canvas
                .querySelector('[data-tab="evals"]')
                ?.getAttribute('aria-selected')
        ).toBe('true')
    })

    it('asks the page to run, rather than running anything itself', () => {
        const { canvas } = mount()
        openEvals(canvas)
        const seen: unknown[] = []
        window.addEventListener(`${PREFIX}eval:run`, (event) =>
            seen.push((event as CustomEvent).detail)
        )

        canvas.querySelector<HTMLButtonElement>('[data-action="run"]')?.click()

        // The toolbar cannot import the engine without duplicating it, so the
        // only thing it does is dispatch.
        expect(seen).toEqual([{ includeChart: false, includeNarrator: false }])
    })

    it('sends the chart and narrator toggles with the run', () => {
        const { canvas } = mount()
        openEvals(canvas)
        const chart = canvas.querySelector<HTMLInputElement>(
            '[data-toggle="chart"]'
        )
        chart!.checked = true
        chart!.dispatchEvent(new Event('change'))

        const seen: unknown[] = []
        window.addEventListener(`${PREFIX}eval:run`, (event) =>
            seen.push((event as CustomEvent).detail)
        )
        canvas.querySelector<HTMLButtonElement>('[data-action="run"]')?.click()

        expect(seen).toEqual([{ includeChart: true, includeNarrator: false }])
    })

    it('shows progress while running and disables a second start', () => {
        const { canvas } = mount()
        openEvals(canvas)

        emitEvent('eval:status', {
            state: 'running',
            completed: 3,
            total: 24,
            dataset: '1,000 streams · 50 artists',
        })

        expect(canvas.textContent).toContain('Running 3/24')
        expect(canvas.textContent).toContain('1,000 streams · 50 artists')
        expect(
            canvas.querySelector<HTMLButtonElement>('[data-action="run"]')
                ?.disabled
        ).toBe(true)
    })

    it('streams each case result as it lands', () => {
        const { canvas } = mount()
        openEvals(canvas)

        emitEvent('eval:case', {
            result: caseResult('top-artists', true, {
                intent: 'top_artists',
                rowCount: 10,
            }),
            spans: [],
        })

        expect(canvas.textContent).toContain('top-artists')
        expect(canvas.textContent).toContain('top_artists')
        expect(canvas.textContent).toContain('10 rows')
    })

    it('explains a failure and offers its trace', () => {
        const { canvas } = mount()
        openEvals(canvas)

        emitEvent('eval:case', {
            result: caseResult('skip-rate', false, {
                failureReason: 'missing required column(s): skipped_listens',
            }),
            spans: [span({ kind: 'router' })],
        })

        expect(canvas.textContent).toContain(
            'missing required column(s): skipped_listens'
        )
        // Only failures expand — a passing case has nothing to read.
        expect(canvas.querySelector('.case-trace')).not.toBeNull()
    })

    it('does not offer a trace for a passing case', () => {
        const { canvas } = mount()
        openEvals(canvas)

        emitEvent('eval:case', {
            result: caseResult('top-artists', true),
            spans: [span({ kind: 'router' })],
        })

        expect(canvas.querySelector('.case-trace')).toBeNull()
    })

    it('shows the delta against the previous comparable run', () => {
        const context = {
            modelId: 'm',
            chartMode: 'infer',
            narrativeMode: 'static',
            datasetId: 'd1',
        }
        localStorage.setItem(
            'tracksy:dev:evalRuns',
            JSON.stringify([
                {
                    startedAt: 1,
                    context,
                    score: { total: 2, passed: 1, rate: 50, byCheck: [] },
                    results: [caseResult('a', true), caseResult('b', false)],
                },
            ])
        )

        const { canvas } = mount()
        openEvals(canvas)
        emitEvent('eval:done', {
            run: {
                startedAt: 2,
                context,
                score: { total: 2, passed: 2, rate: 100, byCheck: [] },
                results: [caseResult('a', true), caseResult('b', true)],
            },
        })

        expect(canvas.textContent).toContain('2/2')
        expect(canvas.textContent).toContain('+50%')
    })

    it('refuses to show a delta when the dataset changed', () => {
        const base = {
            modelId: 'm',
            chartMode: 'infer',
            narrativeMode: 'static',
        }
        localStorage.setItem(
            'tracksy:dev:evalRuns',
            JSON.stringify([
                {
                    startedAt: 1,
                    context: { ...base, datasetId: 'old' },
                    score: { total: 1, passed: 0, rate: 0, byCheck: [] },
                    results: [caseResult('a', false)],
                },
            ])
        )

        const { canvas } = mount()
        openEvals(canvas)
        emitEvent('eval:done', {
            run: {
                startedAt: 2,
                context: { ...base, datasetId: 'new' },
                score: { total: 1, passed: 1, rate: 100, byCheck: [] },
                results: [caseResult('a', true)],
            },
        })

        // A comparison here would credit the prompt for a change of data.
        expect(canvas.textContent).not.toContain('+100%')
        expect(canvas.textContent).toContain('No comparison')
    })

    it('surfaces an error from the runner', () => {
        const { canvas } = mount()
        openEvals(canvas)

        emitEvent('eval:status', {
            state: 'error',
            message: 'No data loaded.',
        })

        expect(canvas.textContent).toContain('No data loaded.')
    })

    it('escapes a failure reason built from model output', () => {
        const { canvas } = mount()
        openEvals(canvas)

        emitEvent('eval:case', {
            result: caseResult('custom-fallback', false, {
                failureReason: 'query failed: <img src=x onerror=alert(1)>',
            }),
            spans: [],
        })

        expect(canvas.querySelector('img')).toBeNull()
        expect(canvas.textContent).toContain('<img src=x onerror=alert(1)>')
    })
})

describe('Langfuse export mode badge', () => {
    beforeEach(() => {
        document.body.replaceChildren()
        vi.restoreAllMocks()
    })

    it('labels a remote target as stripped', async () => {
        vi.spyOn(langfusePanel, 'fetchLangfuseStatus').mockResolvedValue({
            configured: true,
            baseUrl: 'https://cloud.langfuse.com',
            remote: true,
            contentStripped: true,
        })

        const { canvas } = mount()
        // Status resolution is a microtask away from `mount()`.
        await Promise.resolve()
        await Promise.resolve()

        expect(canvas.textContent).toContain('cloud.langfuse.com')
        expect(canvas.textContent).toContain('prompts stripped')
    })

    it('labels a local target as full content', async () => {
        vi.spyOn(langfusePanel, 'fetchLangfuseStatus').mockResolvedValue({
            configured: true,
            baseUrl: 'http://localhost:3999',
            remote: false,
            contentStripped: false,
        })

        const { canvas } = mount()
        await Promise.resolve()
        await Promise.resolve()

        expect(canvas.textContent).toContain('localhost:3999')
        expect(canvas.textContent).toContain('full content')
    })
})
