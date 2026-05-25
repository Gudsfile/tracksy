import type { FC } from 'react'
import { useState } from 'react'
import type { Granularity, StreamTimelineQueryResult } from './query'
import { formatDuration } from '../../../../utils/formatDuration'
import {
    ChartCard,
    ChartCardEmpty,
    ChartTooltip,
} from '../../SimpleCharts/shared'

type TooltipState = {
    x: number
    y: number
    ts: string
    ms_played: number
    count_streams: number
}

type Props = {
    data: StreamTimelineQueryResult[] | undefined
    year: number | undefined
    granularity: Granularity
    availableGranularities: Granularity[]
    onGranularityChange: (g: Granularity) => void
    isLoading?: boolean
}

const GRAN_LABELS: Record<Granularity, string> = {
    year: 'Year',
    month: 'Month',
    week: 'Week',
    day: 'Day',
}

function formatTooltipDate(date: Date, granularity: Granularity): string {
    if (granularity === 'year')
        return date.toLocaleDateString(undefined, { year: 'numeric' })
    if (granularity === 'month')
        return date.toLocaleDateString(undefined, {
            month: 'long',
            year: 'numeric',
        })
    return date.toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
    })
}

function getBarLabel(
    d: StreamTimelineQueryResult,
    index: number,
    data: StreamTimelineQueryResult[],
    year: number | undefined,
    granularity: Granularity
): string {
    const date = new Date(d.ts)

    if (granularity === 'year') return String(date.getUTCFullYear())

    if (granularity === 'month') {
        if (year !== undefined)
            return date.toLocaleDateString(undefined, { month: 'short' })
        return date.getUTCMonth() === 0 ? String(date.getUTCFullYear()) : ''
    }

    if (granularity === 'week') {
        if (index === 0)
            return date.toLocaleDateString(undefined, { month: 'short' })
        const prev = new Date(data[index - 1].ts)
        return date.getUTCMonth() !== prev.getUTCMonth()
            ? date.toLocaleDateString(undefined, { month: 'short' })
            : ''
    }

    // day
    return date.getUTCDate() === 1
        ? date.toLocaleDateString(undefined, { month: 'short' })
        : ''
}

export const StreamTimeline: FC<Props> = ({
    data,
    year,
    granularity,
    availableGranularities,
    onGranularityChange,
    isLoading,
}) => {
    const [tooltip, setTooltip] = useState<TooltipState | null>(null)

    const totalMs = data?.reduce((acc, d) => acc + d.ms_played, 0) ?? 0
    const totalStreams = data?.reduce((acc, d) => acc + d.count_streams, 0) ?? 0
    const maxMs = data?.length ? Math.max(...data.map((d) => d.ms_played)) : 0
    const maxDuration = maxMs || 1

    const sparseLabelLayout = granularity !== 'month' || year === undefined

    return (
        <ChartCard
            title="Stream Timeline"
            emoji="📅"
            isLoading={isLoading}
            question="How did my listening evolve over time?"
        >
            <div className="flex items-center bg-gray-100 dark:bg-slate-800/80 rounded-lg p-1 border border-gray-300/30 self-start mb-3">
                {(['year', 'month', 'week', 'day'] as const).map((g) => {
                    const available = availableGranularities.includes(g)
                    const active = granularity === g
                    return (
                        <button
                            key={g}
                            onClick={() => available && onGranularityChange(g)}
                            disabled={!available}
                            className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-all ${
                                active
                                    ? 'bg-blue-500 text-white shadow-sm'
                                    : available
                                      ? 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
                                      : 'text-gray-300 dark:text-gray-600 cursor-not-allowed'
                            }`}
                        >
                            {GRAN_LABELS[g]}
                        </button>
                    )
                })}
            </div>

            {!data?.length || totalStreams === 0 ? (
                <ChartCardEmpty
                    message={
                        year !== undefined ? 'No data for this year' : 'No data'
                    }
                />
            ) : (
                <>
                    <div className="overflow-x-auto mt-4">
                        <div
                            className="flex items-end gap-0.5 h-24 mb-1"
                            style={{ minWidth: `${data.length * 4}px` }}
                            onMouseLeave={() => setTooltip(null)}
                        >
                            {data.map((d) => {
                                const height = (d.ms_played / maxDuration) * 100
                                const isMax =
                                    d.ms_played === maxMs && d.ms_played > 0
                                return (
                                    <div
                                        key={d.ts}
                                        className={`flex-1 min-w-[3px] rounded-t transition-colors duration-200 ${
                                            isMax
                                                ? 'bg-brand-purple'
                                                : 'bg-brand-blue'
                                        }`}
                                        style={{ height: `${height}%` }}
                                        onMouseEnter={(e) => {
                                            if (d.ms_played === 0) return
                                            const rect =
                                                e.currentTarget.getBoundingClientRect()
                                            setTooltip({
                                                x: rect.left + rect.width / 2,
                                                y: rect.top,
                                                ts: d.ts,
                                                ms_played: d.ms_played,
                                                count_streams: d.count_streams,
                                            })
                                        }}
                                    />
                                )
                            })}
                        </div>

                        <div
                            className="flex gap-0.5 mb-4"
                            style={{ minWidth: `${data.length * 4}px` }}
                        >
                            {data.map((d, i) => {
                                const label = getBarLabel(
                                    d,
                                    i,
                                    data,
                                    year,
                                    granularity
                                )
                                return (
                                    <div
                                        key={d.ts}
                                        className={`flex-1 min-w-[3px] text-[9px] text-gray-400 dark:text-gray-500 ${
                                            sparseLabelLayout
                                                ? 'overflow-visible whitespace-nowrap'
                                                : 'text-center truncate'
                                        }`}
                                    >
                                        {label}
                                    </div>
                                )
                            })}
                        </div>
                    </div>

                    <ul
                        className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700"
                        role="list"
                    >
                        <li
                            className="flex justify-between items-center"
                            role="listitem"
                        >
                            <span className="text-sm text-gray-600 dark:text-gray-400">
                                Total duration
                            </span>
                            <span className="font-bold">
                                {formatDuration(totalMs)}
                            </span>
                        </li>
                        <li
                            className="flex justify-between items-center mt-1"
                            role="listitem"
                        >
                            <span className="text-sm text-gray-600 dark:text-gray-400">
                                Total streams
                            </span>
                            <span className="font-bold">
                                {totalStreams.toLocaleString()}
                            </span>
                        </li>
                    </ul>
                </>
            )}
            {tooltip && (
                <ChartTooltip x={tooltip.x} y={tooltip.y}>
                    <div className="font-semibold">
                        {formatTooltipDate(new Date(tooltip.ts), granularity)}
                    </div>
                    <div className="text-gray-300 dark:text-gray-400">
                        {formatDuration(tooltip.ms_played)}
                    </div>
                    <div className="text-gray-300 dark:text-gray-400">
                        {tooltip.count_streams.toLocaleString()} streams
                    </div>
                </ChartTooltip>
            )}
        </ChartCard>
    )
}
