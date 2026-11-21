import { defineToolbarApp } from 'astro/toolbar'
import type { Span } from 'webllm-otel'
import type { DevBusEventMap } from './devBus'
import { groupByTrace, renderTrace, renderTraceHeader } from './panels/spanTree'
import { renderEvalsPanel, type EvalPanelState } from './panels/evalsPanel'
import { diffRuns, loadRuns, previousComparableRun } from '../llm/evals/store'
import {
    exportSpansToLangfuse,
    fetchLangfuseStatus,
    type LangfuseStatus,
} from './panels/langfuse'
import { escapeHtml } from './escapeHtml'

const PREFIX = 'tracksy:dev:'

/**
 * Spans are kept, not traces: the toolbar lives in its own module graph and
 * cannot read the page's tracer without constructing a second one, so it
 * rebuilds traces from the spans that arrive on the bus.
 */
const MAX_SPANS = 400

const STYLES = `
  .wrap { display: flex; flex-direction: column; gap: 10px; font-family: ui-monospace, monospace; font-size: 12px; min-width: 520px; max-width: 720px; }
  .tabs { display: flex; gap: 4px; }
  .tab { padding: 4px 10px; border-radius: 4px; border: 1px solid rgba(52,56,65,1); background: rgba(27,30,36,1); color: rgba(148,163,184,1); cursor: pointer; font: inherit; }
  .tab[aria-selected="true"] { background: #1d4ed8; color: #eff6ff; border-color: #1d4ed8; }
  .toolbar-row { display: flex; align-items: center; gap: 8px; }
  .spacer { flex: 1; }
  .count { color: rgba(148,163,184,1); }
  .panel { border: 1px solid rgba(52,56,65,1); border-radius: 6px; max-height: 340px; overflow-y: auto; padding: 6px; display: flex; flex-direction: column; gap: 8px; }
  .empty { color: #475569; font-style: italic; padding: 6px; }
  .trace { border: 1px solid rgba(52,56,65,1); border-radius: 5px; overflow: hidden; }
  .trace-header { display: flex; align-items: center; gap: 8px; padding: 5px 8px; background: rgba(27,30,36,1); }
  .trace-question { flex: 1; color: #f8fafc; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  .trace-meta { color: rgba(148,163,184,1); font-size: 10px; white-space: nowrap; }
  .span { margin-left: calc(var(--depth, 0) * 14px); }
  .span-summary { display: flex; align-items: center; gap: 7px; padding: 3px 8px; cursor: pointer; list-style: none; }
  .span-summary::-webkit-details-marker { display: none; }
  .span-summary:hover { background: rgba(27,30,36,0.6); }
  .span-kind { color: #a5f3fc; }
  .span-name { flex: 1; color: rgba(148,163,184,1); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  .span-duration { color: #bfdbfe; font-size: 10px; white-space: nowrap; }
  .span-body { padding: 4px 8px 8px 26px; display: flex; flex-direction: column; gap: 3px; }
  .dot { width: 7px; height: 7px; border-radius: 50%; flex: none; }
  .dot-ok { background: #22c55e; }
  .dot-error { background: #ef4444; }
  .dot-skipped { background: #f59e0b; }
  .dot-pending { background: #64748b; }
  .attr { display: flex; gap: 8px; align-items: baseline; }
  .attr-key { color: rgba(148,163,184,1); min-width: 170px; flex: none; }
  .attr-value { color: #f8fafc; word-break: break-word; }
  .attr-error { color: #fecaca; }
  .content-block { margin-top: 4px; }
  .content-label { color: rgba(148,163,184,1); font-size: 10px; text-transform: uppercase; letter-spacing: .05em; }
  .content-body { margin: 2px 0 0; padding: 6px; background: rgba(27,30,36,1); border-radius: 4px; max-height: 160px; overflow: auto; white-space: pre-wrap; word-break: break-word; color: #e2e8f0; }
  .tab[disabled] { opacity: .45; cursor: default; }
  .toggle { display: flex; align-items: center; gap: 4px; color: rgba(148,163,184,1); }
  .dataset { color: rgba(148,163,184,1); font-size: 10px; }
  .note { color: #bfdbfe; }
  .warn { color: #fecaca; background: rgba(153,27,27,.25); border-radius: 4px; padding: 4px 8px; }
  .summary { display: flex; align-items: center; gap: 8px; padding: 5px 8px; background: rgba(27,30,36,1); border-radius: 5px; }
  .score { color: #f8fafc; font-weight: 600; }
  .score-rate { color: #bfdbfe; }
  .delta { font-size: 10px; padding: 1px 5px; border-radius: 3px; white-space: nowrap; }
  .delta-fixed { background: #166534; color: #bbf7d0; }
  .delta-regressed { background: #991b1b; color: #fecaca; }
  .delta-new { background: #1d4ed8; color: #bfdbfe; }
  .delta-removed { background: rgba(52,56,65,1); color: rgba(148,163,184,1); }
  .case { border-bottom: 1px solid rgba(52,56,65,.6); padding: 3px 0; }
  .case:last-child { border-bottom: none; }
  .case-row { display: flex; align-items: center; gap: 7px; padding: 2px 8px; }
  .case-id { color: #f8fafc; }
  .case-intent { color: #a5f3fc; font-size: 10px; }
  .case-meta { color: rgba(148,163,184,1); font-size: 10px; white-space: nowrap; }
  .case-reason { color: #fecaca; padding: 0 8px 3px 26px; }
  .case-trace { padding: 0 8px 4px 20px; }
  .case-trace-summary { color: rgba(148,163,184,1); font-size: 10px; cursor: pointer; }
`

// eslint-disable-next-line import/no-default-export -- Astro toolbar entrypoint requires default export
export default defineToolbarApp({
    init(canvas, eventTarget) {
        const win = document.createElement('astro-dev-toolbar-window')
        win.setAttribute('placement', 'bottom-center')
        canvas.appendChild(win)

        const style = document.createElement('style')
        style.textContent = STYLES
        win.appendChild(style)

        const wrap = document.createElement('div')
        wrap.className = 'wrap'
        win.appendChild(wrap)

        eventTarget.onToolbarPlacementUpdated(({ placement }) => {
            win.setAttribute('placement', placement)
        })

        const spans: Span[] = []
        let tab: 'traces' | 'evals' = 'traces'
        let langfuse: LangfuseStatus = { configured: false }
        let exportNote = ''
        /** Send each finished eval run onward without another click. */
        let autoExport = false

        const evals: EvalPanelState = {
            status: { state: 'idle' },
            results: [],
            spansByCase: new Map(),
            includeChart: false,
            includeNarrator: false,
        }

        function renderTraces(): string {
            const traces = [...groupByTrace(spans).values()]
            if (traces.length === 0) {
                return `<div class="empty">No assistant turns yet. Ask the chat a question.</div>`
            }
            // Newest first: the turn you just ran is the one you want to read.
            return traces
                .reverse()
                .map(
                    (trace) => `
              <div class="trace">
                ${renderTraceHeader(trace)}
                ${renderTrace(trace)}
              </div>`
                )
                .join('')
        }

        function emit<K extends keyof DevBusEventMap>(
            type: K,
            detail: DevBusEventMap[K]
        ): void {
            window.dispatchEvent(new CustomEvent(PREFIX + type, { detail }))
        }

        /** e.g. "sending to cloud.langfuse.com · prompts stripped". */
        function langfuseModeLabel(): string {
            const host = escapeHtml(langfuse.baseUrl ?? 'Langfuse')
            const contentLabel = langfuse.contentStripped
                ? 'prompts stripped'
                : 'full content'
            return `sending to ${host} · ${contentLabel}`
        }

        function renderExportControls(): string {
            const title = langfuse.configured
                ? `Send the spans held here to ${escapeHtml(langfuse.baseUrl ?? 'Langfuse')}`
                : 'Set LANGFUSE_BASE_URL, LANGFUSE_PUBLIC_KEY and LANGFUSE_SECRET_KEY to enable'
            return `
            <button class="tab" type="button" data-action="export"
                    ${langfuse.configured ? '' : 'disabled'}
                    title="${title}">Send to Langfuse</button>
            <label class="toggle" title="${title}">
              <input type="checkbox" data-toggle="auto-export"
                     ${autoExport ? 'checked' : ''}
                     ${langfuse.configured ? '' : 'disabled'}/> auto
            </label>
            ${langfuse.configured ? `<span class="dataset">${langfuseModeLabel()}</span>` : ''}`
        }

        function renderTracesTab(): string {
            const traceCount = groupByTrace(spans).size
            return `
          <div class="toolbar-row">
            <span class="count">${traceCount} turn${traceCount === 1 ? '' : 's'} · ${spans.length} span${spans.length === 1 ? '' : 's'}</span>
            <span class="spacer"></span>
            ${renderExportControls()}
            <button class="tab" type="button" data-action="clear">Clear</button>
          </div>
          ${exportNote ? `<div class="note">${escapeHtml(exportNote)}</div>` : ''}
          <div class="panel">${renderTraces()}</div>`
        }

        async function sendToLangfuse(toSend: Span[]): Promise<void> {
            exportNote = 'Sending to Langfuse…'
            render()
            const outcome = await exportSpansToLangfuse(toSend)
            exportNote = outcome.ok
                ? `Sent ${outcome.spanCount} span${outcome.spanCount === 1 ? '' : 's'} to Langfuse.`
                : `Langfuse export failed — ${outcome.error}`
            render()
        }

        function render(): void {
            wrap.innerHTML = `
          <div class="tabs">
            <button class="tab" type="button" data-tab="traces" aria-selected="${tab === 'traces'}">Traces</button>
            <button class="tab" type="button" data-tab="evals" aria-selected="${tab === 'evals'}">Evals</button>
          </div>
          ${tab === 'traces' ? renderTracesTab() : renderEvalsPanel(evals)}`

            for (const button of wrap.querySelectorAll<HTMLButtonElement>(
                '[data-tab]'
            )) {
                button.addEventListener('click', () => {
                    tab = button.dataset.tab === 'evals' ? 'evals' : 'traces'
                    render()
                })
            }

            wrap.querySelector('[data-action="clear"]')?.addEventListener(
                'click',
                () => {
                    spans.length = 0
                    exportNote = ''
                    render()
                }
            )

            wrap.querySelector('[data-action="export"]')?.addEventListener(
                'click',
                () => void sendToLangfuse(spans)
            )

            wrap.querySelector('[data-toggle="auto-export"]')?.addEventListener(
                'change',
                (event) => {
                    autoExport = (event.target as HTMLInputElement).checked
                }
            )

            wrap.querySelector('[data-action="run"]')?.addEventListener(
                'click',
                () => {
                    // A fresh run replaces the previous results, but the diff is
                    // computed against the stored history, so the comparison
                    // survives the reset.
                    evals.results = []
                    evals.spansByCase.clear()
                    emit('eval:run', {
                        includeChart: evals.includeChart,
                        includeNarrator: evals.includeNarrator,
                    })
                    render()
                }
            )

            wrap.querySelector('[data-action="cancel"]')?.addEventListener(
                'click',
                () => emit('eval:cancel', {})
            )

            wrap.querySelector('[data-action="load-demo"]')?.addEventListener(
                'click',
                () => {
                    // Destructive: it replaces whatever is loaded, so it asks.
                    if (
                        window.confirm(
                            'Load the demo dataset? This replaces the data currently loaded in DuckDB.'
                        )
                    ) {
                        emit('eval:load-demo', {})
                    }
                }
            )

            for (const input of wrap.querySelectorAll<HTMLInputElement>(
                '[data-toggle]'
            )) {
                input.addEventListener('change', () => {
                    if (input.dataset.toggle === 'chart') {
                        evals.includeChart = input.checked
                    } else {
                        evals.includeNarrator = input.checked
                    }
                })
            }
        }

        function listen<K extends keyof DevBusEventMap>(
            type: K,
            handle: (detail: DevBusEventMap[K]) => void
        ): void {
            window.addEventListener(PREFIX + type, (event) =>
                handle((event as CustomEvent<DevBusEventMap[K]>).detail)
            )
        }

        render()

        listen('agent:span', ({ span }) => {
            spans.push(span)
            if (spans.length > MAX_SPANS) spans.shift()
            render()
        })

        listen('eval:status', (status) => {
            evals.status = status
            render()
        })

        listen('eval:case', ({ result, spans: caseSpans }) => {
            evals.results.push(result)
            evals.spansByCase.set(result.caseId, caseSpans)
            render()
        })

        listen('eval:done', ({ run }) => {
            evals.lastRun = run
            // `saveRun` has already appended this run, so exclude it explicitly
            // rather than diffing it against itself.
            const earlier = loadRuns().filter(
                (stored) => stored.startedAt !== run.startedAt
            )
            // Prefer the newest run that measured the same thing, skipping any
            // in between that used a different model, mode, or dataset.
            const comparable = previousComparableRun(run.context, earlier)
            // Falling back to the newest run when none is comparable is
            // deliberate: `diffRuns` then reports *why* they cannot be compared.
            // "No comparison: the dataset changed" beats an unexplained absence,
            // which reads as "nothing moved".
            const baseline = comparable ?? earlier.at(-1)
            evals.diff = baseline ? diffRuns(run, baseline) : undefined
            render()

            if (autoExport && langfuse.configured) {
                // Export the spans of this run only, identified by the trace ids
                // its cases reported — not the whole buffer, which may still
                // hold unrelated chat turns.
                const traceIds = new Set(
                    evals.results
                        .map((result) => result.traceId)
                        .filter((id): id is string => Boolean(id))
                )
                void sendToLangfuse(
                    spans.filter((span) => traceIds.has(span.traceId))
                )
            }
        })

        void fetchLangfuseStatus().then((status) => {
            langfuse = status
            render()
        })
    },
})
