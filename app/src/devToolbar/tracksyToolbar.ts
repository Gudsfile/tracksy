import { defineToolbarApp } from 'astro/toolbar'
import type { DevBusEventMap } from './devBus'

const PREFIX = 'tracksy:dev:'

type DuckDBEntry = DevBusEventMap['duckdb:query'] & { ts: number }
type InferenceEntry = DevBusEventMap['webllm:inference'] & { ts: number }

const MAX_QUERIES = 50

// Styles for slot content inside astro-dev-toolbar-window.
// Positioning, background, border, shadow, and z-index are all owned by the
// window element itself — we only style the inner sections.
const STYLES = `
  .sections { display: flex; flex-direction: column; gap: 12px; font-family: ui-monospace, monospace; font-size: 12px; }
  .section { border: 1px solid rgba(52, 56, 65, 1); border-radius: 6px; overflow: hidden; }
  .section-header { background: rgba(27, 30, 36, 1); padding: 6px 10px; font-weight: 600; font-size: 11px; letter-spacing: .05em; text-transform: uppercase; color: rgba(148, 163, 184, 1); }
  .section-body { padding: 8px; display: flex; flex-direction: column; gap: 4px; max-height: 120px; overflow-y: auto; }
  .empty { color: #475569; font-style: italic; }
  .row { display: flex; align-items: center; gap: 6px; padding: 4px 6px; border-radius: 4px; background: rgba(27, 30, 36, 1); }
  .sql { flex: 1; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; color: #a5f3fc; }
  .badge { padding: 1px 5px; border-radius: 3px; font-size: 10px; white-space: nowrap; }
  .badge-time { background: #1d4ed8; color: #bfdbfe; }
  .badge-rows { background: #166534; color: #bbf7d0; }
  .badge-error { background: #991b1b; color: #fecaca; }
  .kv { display: flex; gap: 8px; align-items: center; }
  .kv-label { color: rgba(148, 163, 184, 1); }
  .kv-value { color: #f8fafc; font-weight: 600; font-family: ui-monospace, monospace; }
  .progress-bar { height: 6px; background: rgba(27, 30, 36, 1); border-radius: 3px; overflow: hidden; margin-top: 4px; }
  .progress-fill { height: 100%; background: #3b82f6; border-radius: 3px; transition: width .2s; }
`

// eslint-disable-next-line import/no-default-export -- Astro toolbar entrypoint requires default export
export default defineToolbarApp({
    init(canvas, eventTarget) {
        // astro-dev-toolbar-window handles all positioning: fixed, bottom: 72px,
        // z-index: 999999999, background, border, shadow. We own only slot content.
        const win = document.createElement('astro-dev-toolbar-window')
        win.setAttribute('placement', 'bottom-center')
        canvas.appendChild(win)

        const style = document.createElement('style')
        style.textContent = STYLES
        win.appendChild(style)

        const sections = document.createElement('div')
        sections.className = 'sections'
        win.appendChild(sections)

        // Keep window placement in sync with toolbar position
        eventTarget.onToolbarPlacementUpdated(({ placement }) => {
            win.setAttribute('placement', placement)
        })

        // --- State ---
        const queries: DuckDBEntry[] = []
        let totalQueries = 0
        let loadState: DevBusEventMap['webllm:load'] | null = null
        let lastInference: InferenceEntry | null = null
        let lastStream:
            | (DevBusEventMap['stream:parsed'] & { ts: number })
            | null = null

        // --- Render helpers ---
        function fmt(ms: number): string {
            return ms < 1 ? '<1ms' : `${Math.round(ms)}ms`
        }

        function renderDuckDB(): string {
            if (queries.length === 0) {
                return `<div class="empty">No queries yet.</div>`
            }
            return queries
                .slice()
                .reverse()
                .map(
                    (q) => `
              <div class="row">
                <span class="sql" title="${q.sql.replace(/"/g, '&quot;')}">${q.sql}</span>
                <span class="badge badge-time">${fmt(q.durationMs)}</span>
                <span class="badge badge-rows">${q.rowCount} rows</span>
                ${q.error ? `<span class="badge badge-error">ERR</span>` : ''}
              </div>`
                )
                .join('')
        }

        function renderWebLLM(): string {
            const model = loadState?.model ?? lastInference?.model ?? '—'
            const pct = loadState ? Math.round(loadState.progress * 100) : 100
            const loadText = loadState?.text ?? 'Ready'
            const latency = lastInference ? fmt(lastInference.durationMs) : '—'
            const tps = lastInference
                ? `${lastInference.tokensPerSec.toFixed(1)} tok/s`
                : '—'
            return `
          <div class="kv"><span class="kv-label">Model</span><span class="kv-value">${model}</span></div>
          <div class="kv"><span class="kv-label">Load</span><span class="kv-value">${pct}% — ${loadText}</span></div>
          <div class="progress-bar"><div class="progress-fill" style="width:${pct}%"></div></div>
          <div class="kv"><span class="kv-label">Latency</span><span class="kv-value">${latency}</span></div>
          <div class="kv"><span class="kv-label">Tokens/s</span><span class="kv-value">${tps}</span></div>`
        }

        function renderStream(): string {
            if (!lastStream)
                return `<div class="empty">No file parsed yet.</div>`
            return `
          <div class="kv"><span class="kv-label">Provider</span><span class="kv-value">${lastStream.provider}</span></div>
          <div class="kv"><span class="kv-label">Records</span><span class="kv-value">${lastStream.recordCount}</span></div>
          <div class="kv"><span class="kv-label">Parse time</span><span class="kv-value">${fmt(lastStream.durationMs)}</span></div>`
        }

        function render(): void {
            sections.innerHTML = `
          <div class="section">
            <div class="section-header">DuckDB — ${totalQueries > MAX_QUERIES ? `last ${MAX_QUERIES} of ${totalQueries} queries` : `${totalQueries} ${totalQueries === 1 ? 'query' : 'queries'}`}</div>
            <div class="section-body">${renderDuckDB()}</div>
          </div>
          <div class="section">
            <div class="section-header">WebLLM</div>
            <div class="section-body">${renderWebLLM()}</div>
          </div>
          <div class="section">
            <div class="section-header">StreamProvider</div>
            <div class="section-body">${renderStream()}</div>
          </div>`
        }

        render()

        // --- devBus listeners ---
        function listen<K extends keyof DevBusEventMap>(
            type: K,
            cb: (d: DevBusEventMap[K]) => void
        ): void {
            window.addEventListener(PREFIX + type, (e) =>
                cb((e as CustomEvent<DevBusEventMap[K]>).detail)
            )
        }

        listen('duckdb:query', (d) => {
            queries.push({ ...d, ts: Date.now() })
            totalQueries++
            if (queries.length > MAX_QUERIES) queries.shift()
            render()
        })

        listen('webllm:load', (d) => {
            loadState = d
            render()
        })

        listen('webllm:inference', (d) => {
            lastInference = { ...d, ts: Date.now() }
            render()
        })

        listen('stream:parsed', (d) => {
            lastStream = { ...d, ts: Date.now() }
            render()
        })
    },
})
