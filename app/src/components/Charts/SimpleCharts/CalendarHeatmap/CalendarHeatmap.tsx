import type { FC } from 'react'
import type { CalendarHeatmapQueryResult } from './query'
import { buildCells } from './buildCells'
import { ChartCard } from '../shared'

const DAY_LABELS = ['', 'Mon', '', 'Wed', '', 'Fri', '']

type Cell = ReturnType<typeof buildCells>[number]

type Props = {
    data: CalendarHeatmapQueryResult[] | undefined
    year: number | undefined
    isLoading?: boolean
}

export const CalendarHeatmap: FC<Props> = ({ data, year, isLoading }) => {
    if (year === undefined) {
        return (
            <ChartCard title="Listening activity" emoji="🗓️">
                <p className="text-sm text-gray-400 dark:text-gray-500 italic text-center py-6">
                    Select a year to view the calendar
                </p>
            </ChartCard>
        )
    }

    const cells = data ? buildCells(data, year) : []
    const maxCount = Math.max(1, ...cells.map((c) => c.stream_count))
    const weekCount = cells.length > 0 ? cells[cells.length - 1].week + 1 : 0

    const grid: Array<Array<Cell | null>> = Array.from(
        { length: weekCount },
        (_, w) => {
            const row: Array<Cell | null> = Array(7).fill(null)
            cells
                .filter((c) => c.week === w)
                .forEach((c) => {
                    row[c.dayOfWeek] = c
                })
            return row
        }
    )

    return (
        <ChartCard
            title={`Listening activity ${year}`}
            emoji="🗓️"
            isLoading={isLoading}
        >
            {data && (
                <div className="flex gap-2 overflow-x-auto">
                    <div className="flex flex-col gap-[3px] pt-0.5 shrink-0">
                        {DAY_LABELS.map((label, i) => (
                            <div
                                key={i}
                                className="h-[10px] text-[8px] leading-[10px] text-right text-gray-400 dark:text-gray-600 w-6"
                            >
                                {label}
                            </div>
                        ))}
                    </div>
                    <div className="flex gap-[3px]">
                        {grid.map((week, wi) => (
                            <div key={wi} className="flex flex-col gap-[3px]">
                                {week.map((cell, di) => (
                                    <div
                                        key={di}
                                        title={
                                            cell
                                                ? `${cell.date}: ${cell.stream_count} streams`
                                                : undefined
                                        }
                                        className={`w-[10px] h-[10px] rounded-[2px] shrink-0 ${
                                            !cell || cell.stream_count === 0
                                                ? 'bg-gray-100 dark:bg-slate-700/50'
                                                : ''
                                        }`}
                                        style={
                                            cell && cell.stream_count > 0
                                                ? {
                                                      backgroundColor: `rgba(124, 58, 237, ${Math.max(0.15, cell.stream_count / maxCount)})`,
                                                  }
                                                : undefined
                                        }
                                    />
                                ))}
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </ChartCard>
    )
}
