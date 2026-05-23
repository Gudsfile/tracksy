import { defineToolbarApp } from 'astro/toolbar'
import type { DevBusEventMap } from './devBus'

const PREFIX = 'tracksy:dev:'

type DuckDBEntry = DevBusEventMap['duckdb:query'] & { ts: number }
type InferenceEntry = DevBusEventMap['webllm:inference'] & { ts: number }

const MAX_QUERIES = 20

const STYLES = `
  :host { font-family: ui-monospace, monospace; font-size: 12px; color: #e2e8f0; }
  .panel { display: flex; flex-direction: column; gap: 12px; padding: 12px; width: 420px; max-height: 480px; overflow-y: auto; background: #0f172a; border-radius: 8px; }
  .section { border: 1px solid #1e293b; border-radius: 6px; overflow: hidden; }
  .section-header { background: #1e293b; padding: 6px 10px; font-weight: 600; font-size: 11px; letter-spacing: .05em; text-transform: uppercase; color: #94a3b8; }
  .section-body { padding: 8px; display: flex; flex-direction: column; gap: 4px; }
  .empty { color: #475569; font-style: italic; }
  .row { display: flex; align-items: center; gap: 6px; padding: 4px 6px; border-radius: 4px; background: #1e293b; }
  .sql { flex: 1; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; color: #a5f3fc; }
  .badge { padding: 1px 5px; border-radius: 3px; font-size: 10px; white-space: nowrap; }
  .badge-time { background: #1d4ed8; color: #bfdbfe; }
  .badge-rows { background: #166534; color: #bbf7d0; }
  .badge-error { background: #991b1b; color: #fecaca; }
  .kv { display: flex; gap: 8px; align-items: center; }
  .kv-label { color: #94a3b8; }
  .kv-value { color: #f8fafc; font-weight: 600; }
  .progress-bar { height: 6px; background: #1e293b; border-radius: 3px; overflow: hidden; margin-top: 4px; }
  .progress-fill { height: 100%; background: #3b82f6; border-radius: 3px; transition: width .2s; }
`

// eslint-disable-next-line import/no-default-export -- Astro toolbar entrypoint requires default export
export default defineToolbarApp({
    init(canvas) {
        const style = document.createElement('style')
        style.textContent = STYLES
        canvas.appendChild(style)

        const panel = document.createElement('div')
        panel.className = 'panel'
        canvas.appendChild(panel)

        // --- State ---
        const queries: DuckDBEntry[] = []
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
                .slice(-20)
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
            panel.innerHTML = `
          <div class="section">
            <div class="section-header">DuckDB — ${queries.length} queries</div>
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
