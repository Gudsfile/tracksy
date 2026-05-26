import { Fragment } from 'react'
import type { StreamPerDayOfWeekQueryResult } from './query'
import { ChartCard } from '../../SimpleCharts/shared'

const CELL_GAP = 3
const LABEL_WIDTH = 24
const MIN_CELL_WIDTH = 10

const DAY_LABELS = ['', 'Mon', '', 'Wed', '', 'Fri', '']
const HOUR_LABELS = Array.from({ length: 24 }, (_, h) =>
    h % 6 === 0 ? String(h) : ''
)

type Props = {
    data: StreamPerDayOfWeekQueryResult[] | undefined
    isLoading?: boolean
}

export function StreamPerDayOfWeekView({ isLoading }: Props) {
    return (
        <ChartCard
            title="Listening Bingo"
            emoji="🎰"
            question="Have you listened at every hour of every day?"
            isLoading={isLoading}
        >
            <div className="overflow-x-auto">
                <div
                    style={{
                        display: 'grid',
                        gridTemplateColumns: `${LABEL_WIDTH}px repeat(24, 1fr)`,
                        gap: `${CELL_GAP}px`,
                        minWidth: `${LABEL_WIDTH + 24 * (CELL_GAP + MIN_CELL_WIDTH)}px`,
                    }}
                >
                    {/* Hour labels row */}
                    <div />
                    {HOUR_LABELS.map((label, h) => (
                        <div
                            key={h}
                            className="text-[8px] text-center text-gray-400 dark:text-gray-600"
                        >
                            {label}
                        </div>
                    ))}

                    {/* Day rows */}
                    {DAY_LABELS.map((dayLabel, d) => (
                        <Fragment key={d}>
                            <div className="text-[8px] flex items-center justify-end pr-1 text-gray-400 dark:text-gray-600">
                                {dayLabel}
                            </div>
                            {Array.from({ length: 24 }, (_, h) => (
                                <div
                                    key={h}
                                    style={{ aspectRatio: '1' }}
                                    className="rounded-xs bg-gray-100 dark:bg-slate-700/50"
                                />
                            ))}
                        </Fragment>
                    ))}
                </div>
            </div>
        </ChartCard>
    )
}
