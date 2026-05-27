import type { FC } from 'react'
import { useState } from 'react'
import type { StreamTimelineQueryResult } from './query'
import type { Granularity } from '../shared/types'
import { formatDuration } from '../../../../utils/formatDuration'
import {
    ChartCard,
    ChartCardEmpty,
    ChartTooltip,
} from '../../SimpleCharts/shared'
import { GranularityTabs } from '../shared/GranularityTabs'
import { InsightList, InsightRow } from '../shared/InsightList'

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
            <GranularityTabs
                value={granularity}
                available={availableGranularities}
                onChange={onGranularityChange}
            />

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

                    <InsightList>
                        <InsightRow
                            label="Total duration"
                            value={formatDuration(totalMs)}
                        />
                        <InsightRow
                            label="Total streams"
                            value={totalStreams.toLocaleString()}
                        />
                    </InsightList>
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
