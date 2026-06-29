import { useContext, useEffect, useRef } from 'react'
import * as Plot from '@observablehq/plot'
import { ThemeContext } from '../../hooks/ThemeContext'
import type { DBRow } from '../../llm/inferChartType'
import type { ChartConfig } from '../../llm/askChartConfig'
import { inferConfig } from '../../llm/askChartConfig'
import { formatDuration } from '../../utils/formatDuration'
import { ChartCard } from '../Charts/SimpleCharts/shared/ChartCard'
import { ChartHero } from '../Charts/SimpleCharts/shared/ChartHero'
import { LabeledProgressBar } from '../Charts/SimpleCharts/shared/LabeledProgressBar'
import { ProgressBar } from '../Charts/SimpleCharts/shared/ProgressBar'
import { RankedList } from '../Charts/SimpleCharts/shared/RankedList'
import { InsightCard } from '../Charts/SimpleCharts/shared/InsightCard'
import { CalendarHeatmap } from '../Charts/SimpleCharts/CalendarHeatmap/CalendarHeatmap'
import type { CalendarHeatmapQueryResult } from '../Charts/SimpleCharts/CalendarHeatmap/query'
import { HourlyStreams } from '../Charts/SimpleCharts/HourlyStreams/HourlyStreams'
import type { HourlyStreamsQueryResult } from '../Charts/SimpleCharts/HourlyStreams/query'
import { classifySkipRate } from '../Charts/SimpleCharts/SkipRate/classifySkipRate'

type Props = {
    title: string
    rows: DBRow[]
    chartConfig?: ChartConfig
}

// ── ranked_list ──────────────────────────────────────────────────────────────

function RankedListView({
    rows,
    config,
}: {
    rows: DBRow[]
    config: Extract<ChartConfig, { type: 'ranked_list' }>
}) {
    const items = rows.map((r) => {
        const rawSecondary =
            config.secondaryKey != null ? r[config.secondaryKey] : undefined
        const secondary =
            rawSecondary != null
                ? config.secondaryKey === 'ms_played' &&
                  typeof rawSecondary === 'number'
                    ? formatDuration(rawSecondary).split(' ')[0]
                    : String(rawSecondary)
                : undefined
        const score = r[config.valueKey]
        return {
            primary: String(r[config.labelKey] ?? ''),
            secondary,
            score:
                typeof score === 'number'
                    ? score.toLocaleString()
                    : String(score ?? ''),
        }
    })
    return <RankedList items={items} />
}

// ── labeled_segments ─────────────────────────────────────────────────────────

function LabeledSegmentsView({
    rows,
    config,
}: {
    rows: DBRow[]
    config: Extract<ChartConfig, { type: 'labeled_segments' }>
}) {
    const row = rows[0]
    if (!row) return null
    const total = Number(row[config.totalKey]) || 0
    const segments = config.segmentKeys.map((k) => ({
        label: k.charAt(0).toUpperCase() + k.slice(1),
        value: Number(row[k]) || 0,
    }))
    const dominant = segments.reduce((a, b) => (a.value > b.value ? a : b))
    const pct = (v: number) => (total > 0 ? (v / total) * 100 : 0)

    return (
        <>
            <ChartHero
                label={dominant.label}
                sublabel={`${dominant.value.toLocaleString()} streams`}
            />
            <ul className="space-y-3" role="list">
                {segments.map((s) => (
                    <li key={s.label} role="listitem">
                        <LabeledProgressBar
                            label={s.label}
                            value={`${pct(s.value).toFixed(1)}%`}
                            pct={pct(s.value)}
                            barColor="bg-brand-purple"
                        />
                    </li>
                ))}
            </ul>
        </>
    )
}

// ── skip_rate ─────────────────────────────────────────────────────────────────

function SkipRateView({ rows }: { rows: DBRow[] }) {
    const row = rows[0]
    if (!row) return null
    const complete = Number(row['complete_listens']) || 0
    const skipped = Number(row['skipped_listens']) || 0
    const total = complete + skipped
    const completePct = total > 0 ? (complete / total) * 100 : 0
    const { classification, emoji, message } = classifySkipRate(completePct)

    return (
        <>
            <ChartHero
                label={classification}
                sublabel={`${completePct.toFixed(1)}% are full listens`}
                emoji={emoji}
            />
            <ProgressBar pct={completePct} color="bg-green-500" />
            <ul
                className="flex justify-between text-xs text-gray-600 dark:text-gray-400 mb-3"
                role="list"
            >
                <li role="listitem">Skipped ({skipped.toLocaleString()})</li>
                <li role="listitem">Completed ({complete.toLocaleString()})</li>
            </ul>
            <InsightCard>{message}</InsightCard>
        </>
    )
}

// ── metric ────────────────────────────────────────────────────────────────────

function MetricView({
    rows,
    config,
}: {
    rows: DBRow[]
    config: Extract<ChartConfig, { type: 'metric' }>
}) {
    const value = rows[0]?.[config.key]
    return (
        <div className="flex flex-col items-center justify-center py-8">
            <p className="text-5xl font-bold text-gray-900 dark:text-gray-100">
                {typeof value === 'number'
                    ? value.toLocaleString()
                    : String(value ?? '')}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                {config.key}
            </p>
        </div>
    )
}

// ── bar / line (Observable Plot) ──────────────────────────────────────────────

function PlotView({
    rows,
    config,
}: {
    rows: DBRow[]
    config: Extract<ChartConfig, { type: 'bar' | 'line' }>
}) {
    const containerRef = useRef<HTMLDivElement>(null)
    const { effectiveTheme } = useContext(ThemeContext)
    const isDark = effectiveTheme === 'dark'

    useEffect(() => {
        if (!containerRef.current) return

        const textColor = isDark ? '#e2e8f0' : '#1e293b'
        const gridColor = isDark ? '#334155' : '#e2e8f0'

        const mark =
            config.type === 'bar'
                ? Plot.barY(rows, {
                      x: config.x,
                      y: config.y,
                      fill: 'steelblue',
                      tip: true,
                  })
                : Plot.lineY(rows, {
                      x: config.x,
                      y: config.y,
                      stroke: 'steelblue',
                      strokeWidth: 2,
                      tip: true,
                  })

        const el = Plot.plot({
            marks: [mark, Plot.ruleY([0])],
            style: { background: 'transparent', color: textColor },
            x: { tickRotate: -45 },
            grid: true,
            color: { legend: false },
        })

        if (el) {
            el.querySelectorAll<SVGElement>('[stroke="currentColor"]').forEach(
                (e) => (e.style.stroke = gridColor)
            )
            containerRef.current.replaceChildren(el)
        }

        return () => {
            el?.remove()
        }
    }, [rows, config, isDark])

    return <div ref={containerRef} className="overflow-x-auto" />
}

// ── table fallback ────────────────────────────────────────────────────────────

function TableView({ rows }: { rows: DBRow[] }) {
    if (!rows.length)
        return (
            <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">
                No results returned.
            </p>
        )
    const keys = Object.keys(rows[0])
    return (
        <div className="overflow-x-auto">
            <table className="w-full text-sm border-collapse">
                <thead>
                    <tr>
                        {keys.map((k) => (
                            <th
                                key={k}
                                className="text-left px-2 py-1 border-b border-gray-200 dark:border-slate-700 font-medium text-gray-700 dark:text-gray-300"
                            >
                                {k}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {rows.slice(0, 200).map((row, i) => (
                        <tr
                            key={i}
                            className="odd:bg-gray-50 dark:odd:bg-slate-800/40"
                        >
                            {keys.map((k) => (
                                <td
                                    key={k}
                                    className="px-2 py-1 text-gray-900 dark:text-gray-100 max-w-xs truncate"
                                >
                                    {row[k] != null ? String(row[k]) : '—'}
                                </td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
            {rows.length > 200 && (
                <p className="text-xs text-gray-400 dark:text-gray-500 text-center py-2">
                    Showing 200 of {rows.length.toLocaleString()} rows
                </p>
            )}
        </div>
    )
}

// ── main renderer ─────────────────────────────────────────────────────────────

export function GenericChartRenderer({ title, rows, chartConfig }: Props) {
    const config = chartConfig ?? inferConfig(rows)

    let content: React.ReactNode

    if (config.type === 'ranked_list') {
        content = <RankedListView rows={rows} config={config} />
    } else if (config.type === 'labeled_segments') {
        content = <LabeledSegmentsView rows={rows} config={config} />
    } else if (config.type === 'skip_rate') {
        content = <SkipRateView rows={rows} />
    } else if (config.type === 'calendar_heatmap') {
        const dateStr = String(rows[0]?.[config.dateKey] ?? '')
        const year = dateStr ? new Date(dateStr).getFullYear() : undefined
        content = (
            <CalendarHeatmap
                data={
                    rows.map((r) => ({
                        stream_date: String(r[config.dateKey] ?? ''),
                        stream_count: Number(r[config.countKey]) || 0,
                    })) as CalendarHeatmapQueryResult[]
                }
                year={year}
            />
        )
    } else if (config.type === 'radial') {
        content = (
            <HourlyStreams
                data={
                    rows.map((r) => ({
                        play_hour: Number(r[config.angleKey]) || 0,
                        count_streams: Number(r[config.countKey]) || 0,
                        ms_played: Number(r['ms_played']) || 0,
                    })) as HourlyStreamsQueryResult[]
                }
            />
        )
    } else if (config.type === 'metric') {
        content = <MetricView rows={rows} config={config} />
    } else if (config.type === 'bar' || config.type === 'line') {
        content = <PlotView rows={rows} config={config} />
    } else {
        content = <TableView rows={rows} />
    }

    // calendar_heatmap and radial render their own ChartCard internally
    if (config.type === 'calendar_heatmap' || config.type === 'radial') {
        return <>{content}</>
    }

    return <ChartCard title={title}>{content}</ChartCard>
}
