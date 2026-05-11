import { useContext, useEffect, useRef } from 'react'
import * as Plot from '@observablehq/plot'
import { ThemeContext } from '../../hooks/ThemeContext'
import { inferChartType, type DBRow } from '../../llm/inferChartType'
import { ChartCard } from '../Charts/SimpleCharts/shared/ChartCard'

type CustomChartProps = {
    title: string
    rows: DBRow[]
}

function MetricCard({ rows }: { rows: DBRow[] }) {
    const first = rows[0]
    const key = Object.keys(first)[0]
    const value = first[key]
    return (
        <div className="flex flex-col items-center justify-center py-8">
            <p className="text-5xl font-bold text-gray-900 dark:text-gray-100">
                {typeof value === 'number'
                    ? value.toLocaleString()
                    : String(value)}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                {key}
            </p>
        </div>
    )
}

function RankedListChart({ rows }: { rows: DBRow[] }) {
    const keys = Object.keys(rows[0])
    const labelKey = keys.find((k) => typeof rows[0][k] === 'string') ?? keys[0]
    const valueKey = keys.find((k) => typeof rows[0][k] === 'number') ?? keys[1]
    const max = Math.max(...rows.map((r) => Number(r[valueKey]) || 0)) || 1

    return (
        <ol className="space-y-2">
            {rows.map((row, i) => {
                const label = String(row[labelKey] ?? '')
                const value = Number(row[valueKey]) || 0
                const pct = (value / max) * 100
                return (
                    <li key={i} className="flex items-center gap-3">
                        <span className="w-5 text-sm text-gray-500 dark:text-gray-400 text-right shrink-0">
                            {i + 1}
                        </span>
                        <div className="flex-1 min-w-0">
                            <div className="flex justify-between mb-0.5">
                                <span className="text-sm truncate text-gray-900 dark:text-gray-100">
                                    {label}
                                </span>
                                <span className="text-xs text-gray-500 dark:text-gray-400 ml-2 shrink-0">
                                    {value.toLocaleString()}
                                </span>
                            </div>
                            <div className="w-full bg-gray-200 dark:bg-slate-700 rounded-full h-1.5">
                                <div
                                    className="bg-gradient-brand h-1.5 rounded-full transition-all"
                                    style={{ width: `${pct}%` }}
                                />
                            </div>
                        </div>
                    </li>
                )
            })}
        </ol>
    )
}

function PlotChart({
    rows,
    chartType,
}: {
    rows: DBRow[]
    chartType: 'bar' | 'line'
}) {
    const containerRef = useRef<HTMLDivElement>(null)
    const { effectiveTheme } = useContext(ThemeContext)
    const isDark = effectiveTheme === 'dark'

    useEffect(() => {
        if (!containerRef.current) return

        const keys = Object.keys(rows[0])
        const labelKey = keys[0]
        const valueKey =
            keys.find((k) => typeof rows[0][k] === 'number') ?? keys[1]

        const textColor = isDark ? '#e2e8f0' : '#1e293b'
        const gridColor = isDark ? '#334155' : '#e2e8f0'

        const mark =
            chartType === 'bar'
                ? Plot.barY(rows, {
                      x: labelKey,
                      y: valueKey,
                      fill: 'steelblue',
                      tip: true,
                  })
                : Plot.lineY(rows, {
                      x: labelKey,
                      y: valueKey,
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
    }, [rows, chartType, isDark])

    return <div ref={containerRef} className="overflow-x-auto" />
}

function TableFallback({ rows }: { rows: DBRow[] }) {
    if (!rows.length) {
        return (
            <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">
                No results returned.
            </p>
        )
    }
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
                                    {row[k] !== null && row[k] !== undefined
                                        ? String(row[k])
                                        : '—'}
                                </td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    )
}

export function CustomChart({ title, rows }: CustomChartProps) {
    const chartType = inferChartType(rows)

    let content: React.ReactNode
    if (chartType === 'metric') {
        content = <MetricCard rows={rows} />
    } else if (chartType === 'list') {
        content = <RankedListChart rows={rows} />
    } else if (chartType === 'bar' || chartType === 'line') {
        content = <PlotChart rows={rows} chartType={chartType} />
    } else {
        content = <TableFallback rows={rows} />
    }

    return <ChartCard title={title}>{content}</ChartCard>
}
