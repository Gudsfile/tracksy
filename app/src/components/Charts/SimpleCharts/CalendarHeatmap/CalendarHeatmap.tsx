import type { FC } from 'react'
import type { CalendarHeatmapQueryResult } from './query'
import { buildCells } from './buildCells'
import { useState } from 'react'
import { createPortal } from 'react-dom'
import { ChartCard } from '../shared'

const MIN_CELL = 10
const LABEL_WIDTH = 24
const CELL_GAP = 3

const DAY_LABELS = ['', 'Mon', '', 'Wed', '', 'Fri', '']

type Cell = ReturnType<typeof buildCells>[number]
type TooltipState = { cell: Cell; x: number; y: number }

function formatDate(dateStr: string): string {
    const [y, m, d] = dateStr.split('-').map(Number)
    return new Date(y, m - 1, d).toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
    })
}

type Props = {
    data: CalendarHeatmapQueryResult[] | undefined
    year: number | undefined
    isLoading?: boolean
}

export const CalendarHeatmap: FC<Props> = ({ data, year, isLoading }) => {
    const [tooltip, setTooltip] = useState<TooltipState | null>(null)

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
    const weekCount = cells.length > 0 ? cells[cells.length - 1].week + 1 : 53

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

    const handleMouseEnter = (
        e: React.MouseEvent<HTMLDivElement>,
        cell: Cell
    ) => {
        const rect = e.currentTarget.getBoundingClientRect()
        setTooltip({ cell, x: rect.left + rect.width / 2, y: rect.top })
    }

    // Minimum grid width so cells never shrink below MIN_CELL before scrolling kicks in.
    // Gaps: 1 between label col and weeks + (weekCount-1) between weeks = weekCount total.
    const minGridWidth = LABEL_WIDTH + weekCount * (CELL_GAP + MIN_CELL)

    return (
        <ChartCard
            title={`Listening activity ${year}`}
            emoji="🗓️"
            isLoading={isLoading}
        >
            {data && (
                <div className="overflow-x-auto">
                    <div
                        style={{
                            display: 'grid',
                            gridTemplateColumns: `${LABEL_WIDTH}px repeat(${weekCount}, 1fr)`,
                            gridTemplateRows: 'repeat(7, auto)',
                            gap: `${CELL_GAP}px`,
                            minWidth: `${minGridWidth}px`,
                        }}
                    >
                        {DAY_LABELS.map((label, dayIdx) => (
                            <div
                                key={`label-${dayIdx}`}
                                style={{ gridColumn: 1, gridRow: dayIdx + 1 }}
                                className="text-[8px] flex items-center justify-end pr-1 text-gray-400 dark:text-gray-600"
                            >
                                {label}
                            </div>
                        ))}
                        {grid.flatMap((week, wi) =>
                            week.map((cell, di) =>
                                cell === null ? (
                                    <div
                                        key={`${wi}-${di}`}
                                        style={{
                                            gridColumn: wi + 2,
                                            gridRow: di + 1,
                                            aspectRatio: '1',
                                        }}
                                    />
                                ) : (
                                    <div
                                        key={`${wi}-${di}`}
                                        style={{
                                            gridColumn: wi + 2,
                                            gridRow: di + 1,
                                            aspectRatio: '1',
                                            ...(cell.stream_count > 0 && {
                                                backgroundColor: `rgba(124, 58, 237, ${Math.max(0.15, cell.stream_count / maxCount)})`,
                                            }),
                                        }}
                                        className={`rounded-xs ${cell.stream_count === 0 ? 'bg-gray-100 dark:bg-slate-700/50' : ''}`}
                                        onMouseEnter={(e) =>
                                            handleMouseEnter(e, cell)
                                        }
                                        onMouseLeave={() => setTooltip(null)}
                                    />
                                )
                            )
                        )}
                    </div>
                </div>
            )}
            {tooltip &&
                createPortal(
                    <div
                        className="fixed z-50 pointer-events-none"
                        style={{
                            left: tooltip.x,
                            top: tooltip.y - 8,
                            transform: 'translate(-50%, -100%)',
                        }}
                    >
                        <div className="bg-gray-900 dark:bg-slate-700 text-white rounded-lg shadow-lg px-2.5 py-1.5 text-[11px] whitespace-nowrap">
                            <div className="font-semibold">
                                {formatDate(tooltip.cell.date)}
                            </div>
                            <div className="text-gray-300 dark:text-gray-400">
                                {tooltip.cell.stream_count} streams
                            </div>
                        </div>
                        <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-900 dark:border-t-slate-700" />
                    </div>,
                    document.body
                )}
        </ChartCard>
    )
}
