import { useMemo, useState } from 'react'
import type { Top10EvolutionQueryResult } from './query'
import { ChartTooltip } from '../../SimpleCharts/shared/ChartTooltip'
import { BAR_CHART_COLORS } from '../barChartColors'

const WIDTH = 1200
const HEIGHT = 700
const MARGIN = { top: 20, right: 200, bottom: 40, left: 60 }
const PLOT_W = WIDTH - MARGIN.left - MARGIN.right
const PLOT_H = HEIGHT - MARGIN.top - MARGIN.bottom
const LOG_TICK_STEPS = [1, 2, 5]

// SVG needs stroke/fill, so reuse the Tailwind theme variable behind each bg-* class
const SERIES_COLORS = BAR_CHART_COLORS.map(
    (bgClass) => `var(--color-${bgClass.replace(/^bg-/, '')})`
)

type Series = {
    entity_name: string
    color: string
    points: Top10EvolutionQueryResult[]
}

type TooltipState = {
    x: number
    y: number
    point: Top10EvolutionQueryResult
}

function logTicks(maxRank: number): number[] {
    const ticks: number[] = []
    for (let power = 1; power <= maxRank; power *= 10) {
        for (const step of LOG_TICK_STEPS) {
            if (step * power <= maxRank) ticks.push(step * power)
        }
    }
    return ticks
}

export function GlobalTop10Evolution({
    data,
}: {
    data: Top10EvolutionQueryResult[]
}) {
    const [tooltip, setTooltip] = useState<TooltipState | null>(null)

    const { series, labels, years, rankTicks, xScale, yScale } = useMemo(() => {
        const byEntityName = new Map<string, Top10EvolutionQueryResult[]>()
        for (const row of data) {
            if (!byEntityName.has(row.entity_name))
                byEntityName.set(row.entity_name, [])
            byEntityName.get(row.entity_name)!.push(row)
        }

        const lastPoints = Array.from(byEntityName.values())
            .map((points) => {
                points.sort((a, b) => a.stream_year - b.stream_year)
                return points[points.length - 1]
            })
            .sort((a, b) => a.stream_rank - b.stream_rank)

        // Same assignment as Top10Race: colors in order of first appearance over time
        const colorMap = new Map<string, string>()
        for (const row of [...data].sort(
            (a, b) => a.stream_year - b.stream_year
        )) {
            if (!colorMap.has(row.entity_name)) {
                colorMap.set(
                    row.entity_name,
                    SERIES_COLORS[colorMap.size % SERIES_COLORS.length]
                )
            }
        }

        const allSeries: Series[] = lastPoints.map((last) => ({
            entity_name: last.entity_name,
            color: colorMap.get(last.entity_name)!,
            points: byEntityName.get(last.entity_name)!,
        }))

        const minYear = Math.min(...data.map((d) => d.stream_year))
        const maxYear = Math.max(...data.map((d) => d.stream_year))
        const maxRank = Math.max(2, ...data.map((d) => d.stream_rank))

        const x = (year: number) =>
            MARGIN.left +
            (maxYear === minYear
                ? PLOT_W / 2
                : ((year - minYear) / (maxYear - minYear)) * PLOT_W)
        // Log scale, reversed: rank 1 at the top
        const y = (rank: number) =>
            MARGIN.top + (Math.log(rank) / Math.log(maxRank)) * PLOT_H

        return {
            series: allSeries,
            labels: lastPoints,
            years: Array.from(
                { length: maxYear - minYear + 1 },
                (_, i) => minYear + i
            ),
            rankTicks: logTicks(maxRank),
            xScale: x,
            yScale: y,
        }
    }, [data])

    const colorOf = new Map(series.map((s) => [s.entity_name, s.color]))
    const hoveredPoint = tooltip?.point.entity_name

    return (
        <>
            <svg
                viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
                className="w-full h-auto"
                onMouseLeave={() => setTooltip(null)}
            >
                {/* Y grid and ticks */}
                {rankTicks.map((rank) => (
                    <g key={rank}>
                        <line
                            x1={MARGIN.left}
                            x2={MARGIN.left + PLOT_W}
                            y1={yScale(rank)}
                            y2={yScale(rank)}
                            className="stroke-gray-200 dark:stroke-slate-700"
                            strokeWidth={1}
                        />
                        <text
                            x={MARGIN.left - 8}
                            y={yScale(rank)}
                            textAnchor="end"
                            dominantBaseline="central"
                            fontSize={12}
                            className="fill-gray-500 dark:fill-gray-400"
                        >
                            {rank}
                        </text>
                    </g>
                ))}
                <text
                    x={MARGIN.left - 8}
                    y={MARGIN.top - 8}
                    textAnchor="end"
                    fontSize={12}
                    className="fill-gray-500 dark:fill-gray-400"
                >
                    ↑ Rank
                </text>

                {/* X ticks */}
                {years.map((year) => (
                    <text
                        key={year}
                        x={xScale(year)}
                        y={MARGIN.top + PLOT_H + 20}
                        textAnchor="middle"
                        fontSize={12}
                        className="fill-gray-500 dark:fill-gray-400"
                    >
                        {year}
                    </text>
                ))}
                <text
                    x={MARGIN.left + PLOT_W}
                    y={HEIGHT - 4}
                    textAnchor="end"
                    fontSize={12}
                    className="fill-gray-500 dark:fill-gray-400"
                >
                    Year →
                </text>

                {/* Lines and dots */}
                {series.map(({ entity_name, color, points }) => {
                    const dimmed =
                        hoveredPoint !== undefined &&
                        hoveredPoint !== entity_name
                    return (
                        <g
                            key={entity_name}
                            className="transition-opacity duration-150"
                            stroke={color}
                            fill={color}
                            opacity={dimmed ? 0.2 : 1}
                        >
                            <polyline
                                points={points
                                    .map(
                                        (p) =>
                                            `${xScale(p.stream_year)},${yScale(p.stream_rank)}`
                                    )
                                    .join(' ')}
                                fill="none"
                                strokeWidth={2.5}
                                strokeLinejoin="round"
                                strokeLinecap="round"
                            />
                            {points.map((p) => (
                                <circle
                                    key={p.stream_year}
                                    cx={xScale(p.stream_year)}
                                    cy={yScale(p.stream_rank)}
                                    r={hoveredPoint === entity_name ? 6 : 4}
                                    strokeWidth={0}
                                    onMouseEnter={(e) => {
                                        const rect =
                                            e.currentTarget.getBoundingClientRect()
                                        setTooltip({
                                            x: rect.left + rect.width / 2,
                                            y: rect.top,
                                            point: p,
                                        })
                                    }}
                                />
                            ))}
                        </g>
                    )
                })}

                {/* End-of-line labels, alternating above/below to limit overlap */}
                {labels.map((p, i) => (
                    <text
                        key={p.entity_name}
                        x={xScale(p.stream_year) + 10}
                        y={yScale(p.stream_rank) + (i % 2 === 0 ? -8 : 8)}
                        dominantBaseline="central"
                        fontSize={11}
                        fontWeight="bold"
                        fill={colorOf.get(p.entity_name)}
                    >
                        {p.entity_name}
                    </text>
                ))}
            </svg>
            {tooltip && (
                <ChartTooltip
                    x={tooltip.x}
                    y={tooltip.y}
                    title={tooltip.point.entity_name}
                    rows={[
                        `Rank: ${tooltip.point.stream_rank}`,
                        `Year: ${tooltip.point.stream_year}`,
                        `${tooltip.point.play_count.toLocaleString()} streams`,
                    ]}
                />
            )}
        </>
    )
}
