import type { FC } from 'react'
import { useState } from 'react'
import type { EvolutionResult } from './query'
import { formatDuration } from '../../../../utils/formatDuration'
import { ChartCard, ChartCardEmpty, ChartTooltip } from '../shared'

type TooltipState = {
    x: number
    y: number
    year: number
    streams: number
    ms_played: number
}

type Props = {
    data: EvolutionResult[] | undefined
    year: number | undefined
    isLoading?: boolean
}

export const EvolutionOverTime: FC<Props> = ({ data, year, isLoading }) => {
    const [tooltip, setTooltip] = useState<TooltipState | null>(null)
    const maxStreams = data?.length
        ? Math.max(...data.map((d) => d.streams))
        : 0
    const currentYearData = data?.find((d) => d.year === year)
    const totalStreams = data?.reduce((acc, curr) => acc + curr.streams, 0) ?? 0
    const totalMsPlayed =
        data?.reduce((acc, curr) => acc + curr.ms_played, 0) ?? 0
    const startYear = data?.length ? Math.min(...data.map((d) => d.year)) : 0

    return (
        <ChartCard
            title="Soundtrack Growth"
            emoji="📈"
            className="flex flex-col justify-between h-full"
            isLoading={isLoading}
            question="How has my listening evolved over the years?"
        >
            {!data?.length ? (
                <ChartCardEmpty />
            ) : (
                <>
                    <div
                        className="flex items-end gap-1 h-24 mt-4 mb-2"
                        onMouseLeave={() => setTooltip(null)}
                    >
                        {data.map((d) => {
                            const height = (d.streams / maxStreams) * 100
                            return (
                                <div
                                    key={d.year}
                                    className="flex-1 bg-brand-blue dark:bg-brand-blue rounded-t relative"
                                    style={{ height: `${height}%` }}
                                    onMouseEnter={(e) => {
                                        const rect = (
                                            e.currentTarget as HTMLElement
                                        ).getBoundingClientRect()
                                        setTooltip({
                                            x: rect.left + rect.width / 2,
                                            y: rect.top,
                                            year: d.year,
                                            streams: d.streams,
                                            ms_played: d.ms_played,
                                        })
                                    }}
                                >
                                    <div
                                        className={`absolute bottom-0 left-0 right-0 bg-brand-blue rounded-t transition-all duration-300 ${
                                            d.year === year
                                                ? 'bg-brand-purple'
                                                : ''
                                        }`}
                                        style={{ height: '100%' }}
                                    ></div>
                                </div>
                            )
                        })}
                    </div>
                    <div className="flex justify-between text-xs text-gray-600 dark:text-gray-400 px-1">
                        <span>{startYear}</span>
                        <span>{Math.max(...data.map((d) => d.year))}</span>
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
                                Total streams
                            </span>
                            <span className="font-bold">
                                {totalStreams.toLocaleString()}
                            </span>
                        </li>
                        {currentYearData && (
                            <li
                                className="flex justify-between items-center mt-1"
                                role="listitem"
                            >
                                <span className="text-sm text-gray-600 dark:text-gray-400">
                                    This year
                                </span>
                                <span className="font-bold text-brand-purple dark:text-brand-purple">
                                    {currentYearData.streams.toLocaleString()}
                                </span>
                            </li>
                        )}
                    </ul>
                </>
            )}
            {tooltip && (
                <ChartTooltip x={tooltip.x} y={tooltip.y}>
                    <div className="font-semibold">{tooltip.year}</div>
                    <div className="text-gray-300 dark:text-gray-400">
                        {tooltip.streams.toLocaleString()} streams
                    </div>
                    <div className="text-gray-300 dark:text-gray-400">
                        {formatDuration(tooltip.ms_played)}
                    </div>
                    <div className="border-t border-gray-700 my-1.5" />
                    <div className="text-gray-300 dark:text-gray-400">
                        {totalStreams.toLocaleString()} total streams
                    </div>
                    <div className="text-gray-300 dark:text-gray-400">
                        {formatDuration(totalMsPlayed)} total listening
                    </div>
                </ChartTooltip>
            )}
        </ChartCard>
    )
}
