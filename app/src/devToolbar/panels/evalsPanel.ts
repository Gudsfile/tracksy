import type { Span } from 'webllm-otel'
import type { CaseResult, EvalRun, RunDiff } from '../../llm/evals/types'
import { escapeHtml } from '../escapeHtml'
import { formatDuration, renderTrace } from './spanTree'

export type EvalPanelState = {
    status: {
        state: 'idle' | 'loading-demo' | 'running' | 'done' | 'error'
        message?: string
        completed?: number
        total?: number
        dataset?: string
    }
    /** Results as they stream in, newest run only. */
    results: CaseResult[]
    /** Spans per case id, so a failure can be expanded without a second lookup. */
    spansByCase: Map<string, Span[]>
    includeChart: boolean
    includeNarrator: boolean
    lastRun?: EvalRun
    diff?: RunDiff
}

const DELTA_LABEL: Record<string, string> = {
    fixed: '▲ fixed',
    regressed: '▼ regressed',
    new: '＋ new',
    removed: '－ removed',
    unchanged: '',
}

function renderCase(result: CaseResult, state: EvalPanelState): string {
    const delta = state.diff?.comparable
        ? (state.diff.byCase.get(result.caseId) ?? 'unchanged')
        : 'unchanged'
    const deltaLabel = DELTA_LABEL[delta] ?? ''
    const spans = state.spansByCase.get(result.caseId) ?? []

    const detail = result.passed
        ? ''
        : `<div class="case-reason">${escapeHtml(result.failureReason ?? 'failed')}</div>`

    // Only failures expand. A passing case has nothing you need to read, and
    // making every row expandable buries the ones that matter.
    const trace =
        !result.passed && spans.length > 0
            ? `<details class="case-trace">
                 <summary class="case-trace-summary">trace (${spans.length} spans)</summary>
                 <div>${renderTrace(spans)}</div>
               </details>`
            : ''

    return `
      <div class="case case-${result.passed ? 'pass' : 'fail'}">
        <div class="case-row">
          <span class="dot dot-${result.passed ? 'ok' : 'error'}"></span>
          <span class="case-id">${escapeHtml(result.caseId)}</span>
          ${result.intent ? `<span class="case-intent">${escapeHtml(result.intent)}</span>` : ''}
          <span class="spacer"></span>
          ${deltaLabel ? `<span class="delta delta-${escapeHtml(delta)}">${escapeHtml(deltaLabel)}</span>` : ''}
          ${result.rowCount !== undefined ? `<span class="case-meta">${result.rowCount} rows</span>` : ''}
          <span class="case-meta">${escapeHtml(formatDuration(result.durationMs))}</span>
        </div>
        ${detail}
        ${trace}
      </div>`
}

function renderSummary(state: EvalPanelState): string {
    const { lastRun, diff } = state
    if (!lastRun) return ''

    const { score } = lastRun
    const change =
        diff?.comparable && diff.rateChange !== 0
            ? `<span class="delta delta-${diff.rateChange > 0 ? 'fixed' : 'regressed'}">${diff.rateChange > 0 ? '+' : ''}${diff.rateChange}%</span>`
            : ''

    const incomparable =
        diff && !diff.comparable
            ? `<div class="warn">No comparison: ${escapeHtml(diff.reason ?? 'the runs measured different things')}.</div>`
            : ''

    const worst = score.byCheck
        .map(
            (entry) =>
                `<span class="case-meta">${escapeHtml(entry.check)} ×${entry.failures}</span>`
        )
        .join(' ')

    return `
      <div class="summary">
        <span class="score">${score.passed}/${score.total}</span>
        <span class="score-rate">${score.rate}%</span>
        ${change}
        <span class="spacer"></span>
        ${worst}
      </div>
      ${incomparable}`
}

function renderStatus(state: EvalPanelState): string {
    const { status } = state
    if (status.state === 'error') {
        return `<div class="warn">${escapeHtml(status.message ?? 'Something went wrong.')}</div>`
    }
    if (status.state === 'loading-demo') {
        return `<div class="note">${escapeHtml(status.message ?? 'Loading demo data…')}</div>`
    }
    if (status.state === 'running') {
        return `<div class="note">Running ${status.completed ?? 0}/${status.total ?? 0}…</div>`
    }
    return ''
}

export function renderEvalsPanel(state: EvalPanelState): string {
    const running = state.status.state === 'running'
    const dataset = state.status.dataset ?? 'checking…'

    const body = state.results.length
        ? state.results.map((result) => renderCase(result, state)).join('')
        : `<div class="empty">No run yet. Run the suite to score the router against every intent.</div>`

    return `
      <div class="toolbar-row">
        <button class="tab" type="button" data-action="run" ${running ? 'disabled' : ''}>${running ? 'Running…' : 'Run suite'}</button>
        <button class="tab" type="button" data-action="cancel" ${running ? '' : 'disabled'}>Cancel</button>
        <button class="tab" type="button" data-action="load-demo" ${running ? 'disabled' : ''}>Load demo data</button>
        <span class="spacer"></span>
        <label class="toggle"><input type="checkbox" data-toggle="chart" ${state.includeChart ? 'checked' : ''}/> chart</label>
        <label class="toggle"><input type="checkbox" data-toggle="narrator" ${state.includeNarrator ? 'checked' : ''}/> narrator</label>
      </div>
      <div class="dataset">${escapeHtml(dataset)}</div>
      ${renderStatus(state)}
      ${renderSummary(state)}
      <div class="panel">${body}</div>`
}
