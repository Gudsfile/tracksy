import type { FC } from 'react'
import { useState } from 'react'
import type { StreamPerMonthQueryResult } from './query'
import { formatDuration } from '../../../../utils/formatDuration'
import { formatMonthYear } from '../../../../utils/formatMonthYear'
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
    data: StreamPerMonthQueryResult[] | undefined
    year: number | undefined
    isLoading?: boolean
}

export const StreamPerMonth: FC<Props> = ({ data, year, isLoading }) => {
    const [tooltip, setTooltip] = useState<TooltipState | null>(null)

    const totalMs = data?.reduce((acc, d) => acc + d.ms_played, 0) ?? 0
    const totalStreams = data?.reduce((acc, d) => acc + d.count_streams, 0) ?? 0
    const maxMs = data?.length ? Math.max(...data.map((d) => d.ms_played)) : 0
    const maxDuration = maxMs || 1

    return (
        <ChartCard
            title="Monthly Listening"
            emoji="📅"
            isLoading={isLoading}
            question="How much did I listen each month?"
        >
            {!data?.length || totalStreams === 0 ? (
                <ChartCardEmpty
                    message={
                        year !== undefined ? 'No data for this year' : 'No data'
                    }
                />
            ) : (
                <>
                    <div
                        className="flex items-end gap-0.5 h-24 mt-4 mb-1"
                        onMouseLeave={() => setTooltip(null)}
                    >
                        {data.map((d) => {
                            const height = (d.ms_played / maxDuration) * 100
                            const isMax =
                                d.ms_played === maxMs && d.ms_played > 0
                            return (
                                <div
                                    key={d.ts}
                                    className={`flex-1 rounded-t transition-colors duration-200 ${
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

                    <div className="flex gap-0.5 mb-4">
                        {data.map((d) => {
                            const date = new Date(d.ts)
                            const label =
                                year !== undefined
                                    ? date.toLocaleDateString(undefined, {
                                          month: 'short',
                                      })
                                    : date.getUTCMonth() === 0
                                      ? String(date.getUTCFullYear())
                                      : ''
                            return (
                                <div
                                    key={d.ts}
                                    className={`flex-1 text-[9px] text-gray-400 dark:text-gray-500 ${
                                        year !== undefined
                                            ? 'text-center truncate'
                                            : 'overflow-visible whitespace-nowrap'
                                    }`}
                                >
                                    {label}
                                </div>
                            )
                        })}
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
                        {formatMonthYear(new Date(tooltip.ts))}
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
