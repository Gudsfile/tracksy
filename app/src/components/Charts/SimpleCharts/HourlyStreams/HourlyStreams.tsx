import type { FC } from 'react'
import { useState } from 'react'
import type { HourlyStreamsQueryResult } from './query'
import { ChartCard, ChartTooltip } from '../shared'
import { formatDuration } from '../../../../utils/formatDuration'

const CX = 150
const CY = 150
const MAX_R = 110
const MIN_VISIBLE_R = 4
const KEY_HOURS = new Set([0, 3, 6, 9, 12, 15, 18, 21])

type Props = {
    data: HourlyStreamsQueryResult[] | undefined
    maxHourlyCount?: number
    isLoading?: boolean
}

type TooltipState = {
    x: number
    y: number
    hour: number
    count: number
    ms: number
}

function wedgePath(h: number, r: number, cx: number, cy: number): string {
    const aStart = (h / 24) * 2 * Math.PI - Math.PI / 2
    const aEnd = ((h + 1) / 24) * 2 * Math.PI - Math.PI / 2
    const x1 = cx + r * Math.cos(aStart)
    const y1 = cy + r * Math.sin(aStart)
    const x2 = cx + r * Math.cos(aEnd)
    const y2 = cy + r * Math.sin(aEnd)
    const largeArc = aEnd - aStart > Math.PI ? 1 : 0
    return `M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 ${largeArc} 1 ${x2} ${y2} Z`
}

function labelPos(h: number, radius: number, cx: number, cy: number) {
    const angle = ((h + 0.5) / 24) * 2 * Math.PI - Math.PI / 2
    return {
        x: cx + radius * Math.cos(angle),
        y: cy + radius * Math.sin(angle),
    }
}

export const HourlyStreams: FC<Props> = ({
    data,
    maxHourlyCount,
    isLoading,
}) => {
    const [tooltip, setTooltip] = useState<TooltipState | null>(null)

    const effective =
        maxHourlyCount ??
        (data
            ? Math.max(...data.map((d) => d.count_streams), MIN_VISIBLE_R)
            : 1)

    const peakHour =
        data && data.length > 0
            ? data.reduce((max, row) =>
                  row.count_streams > max.count_streams ? row : max
              ).hour
            : -1

    return (
        <ChartCard
            title="Around the Clock"
            emoji="🕐"
            isLoading={isLoading}
            question="When do you listen to music?"
        >
            {data ? (
                <svg
                    viewBox="0 0 300 300"
                    className="w-full h-auto"
                    onMouseLeave={() => setTooltip(null)}
                >
                    {/* Grid circles */}
                    {[0.25, 0.5, 0.75, 1].map((frac) => (
                        <circle
                            key={frac}
                            cx={CX}
                            cy={CY}
                            r={MAX_R * frac}
                            fill="none"
                            className="stroke-gray-200 dark:stroke-slate-600"
                            strokeWidth={0.5}
                        />
                    ))}

                    {/* Wedges */}
                    {data.map((row) => {
                        const r =
                            row.count_streams > 0
                                ? Math.max(
                                      MIN_VISIBLE_R,
                                      (row.count_streams / effective) * MAX_R
                                  )
                                : 0
                        if (r === 0) return null
                        const isHovered = tooltip?.hour === row.hour
                        const isPeak = row.hour === peakHour
                        return (
                            <path
                                key={row.hour}
                                d={wedgePath(row.hour, r, CX, CY)}
                                className={
                                    isHovered
                                        ? 'fill-teal-300 stroke-white dark:stroke-slate-900'
                                        : isPeak
                                          ? 'fill-teal-600 stroke-white dark:stroke-slate-900'
                                          : 'fill-teal-400 stroke-white dark:stroke-slate-900'
                                }
                                strokeWidth={0.75}
                                onMouseEnter={(e) => {
                                    const rect = (
                                        e.currentTarget as SVGPathElement
                                    )
                                        .closest('svg')!
                                        .getBoundingClientRect()
                                    const aCenter =
                                        ((row.hour + 0.5) / 24) * 2 * Math.PI -
                                        Math.PI / 2
                                    const rMid = r / 2
                                    const svgW = rect.width
                                    const svgH = rect.height
                                    setTooltip({
                                        x:
                                            rect.left +
                                            (CX + rMid * Math.cos(aCenter)) *
                                                (svgW / 300),
                                        y:
                                            rect.top +
                                            (CY + rMid * Math.sin(aCenter)) *
                                                (svgH / 300),
                                        hour: row.hour,
                                        count: row.count_streams,
                                        ms: row.ms_played,
                                    })
                                }}
                            />
                        ))}

                        {/* Wedges */}
                        {data.map((row) => {
                            const r =
                                row.count_streams > 0
                                    ? Math.max(
                                          MIN_VISIBLE_R,
                                          (row.count_streams / effective) *
                                              MAX_R
                                      )
                                    : 0
                            if (r === 0) return null
                            const isHovered = tooltip?.hour === row.hour
                            const isPeak = row.hour === peakHour
                            return (
                                <path
                                    key={row.hour}
                                    d={wedgePath(row.hour, r, CX, CY)}
                                    className={
                                        isHovered
                                            ? 'fill-teal-300 stroke-white dark:stroke-slate-900'
                                            : isPeak
                                              ? 'fill-teal-600 stroke-white dark:stroke-slate-900'
                                              : 'fill-teal-400 stroke-white dark:stroke-slate-900'
                                    }
                                    strokeWidth={0.75}
                                    onMouseEnter={(e) => {
                                        const rect = (
                                            e.currentTarget as SVGPathElement
                                        )
                                            .closest('svg')!
                                            .getBoundingClientRect()
                                        const aCenter =
                                            ((row.hour + 0.5) / 24) *
                                                2 *
                                                Math.PI -
                                            Math.PI / 2
                                        const rMid = r / 2
                                        const svgW = rect.width
                                        const svgH = rect.height
                                        setTooltip({
                                            x:
                                                rect.left +
                                                (CX +
                                                    rMid * Math.cos(aCenter)) *
                                                    (svgW / 300),
                                            y:
                                                rect.top +
                                                (CY +
                                                    rMid * Math.sin(aCenter)) *
                                                    (svgH / 300),
                                            hour: row.hour,
                                            count: row.count_streams,
                                            ms: row.ms_played,
                                        })
                                    }}
                                />
                            )
                        })}

                        {/* Hour labels and tick dots */}
                        {Array.from({ length: 24 }, (_, h) => {
                            const labelRadius = MAX_R + 16
                            const pos = labelPos(h, labelRadius, CX, CY)
                            if (KEY_HOURS.has(h)) {
                                return (
                                    <text
                                        key={h}
                                        x={pos.x}
                                        y={pos.y}
                                        textAnchor="middle"
                                        dominantBaseline="central"
                                        fontSize={9}
                                        fontWeight={500}
                                        className="fill-gray-900 dark:fill-gray-100"
                                    >
                                        {String(h).padStart(2, '0')}
                                    </text>
                                )
                            }
                            return (
                                <circle
                                    key={h}
                                    cx={pos.x}
                                    cy={pos.y}
                                    r={1.5}
                                    className="fill-gray-400 dark:fill-gray-500"
                                />
                            )
                        }
                        return (
                            <circle
                                key={h}
                                cx={pos.x}
                                cy={pos.y}
                                r={1.5}
                                className="fill-gray-400 dark:fill-gray-500"
                            />
                        )
                    })}
                </svg>
            ) : (
                <p className="text-sm text-gray-400 dark:text-gray-500 italic text-center py-6">
                    No data for this year
                </p>
            )}
            {tooltip && (
                <ChartTooltip x={tooltip.x} y={tooltip.y}>
                    <div className="font-semibold">
                        {String(tooltip.hour).padStart(2, '0')}h
                    </div>
                    <div className="text-gray-300 dark:text-gray-400">
                        {tooltip.count} streams
                    </div>
                    <div className="text-gray-300 dark:text-gray-400">
                        {formatDuration(tooltip.ms)}
                    </div>
                </ChartTooltip>
            )}
        </ChartCard>
    )
}
