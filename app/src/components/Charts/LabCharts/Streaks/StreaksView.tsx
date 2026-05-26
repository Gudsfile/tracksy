import { useState, useMemo, useRef, useEffect } from 'react'
import type { StreaksQueryResult } from './query'
import {
    ChartCard,
    ChartCardEmpty,
    ChartTooltip,
} from '../../SimpleCharts/shared'

const CELL_GAP = 3
const LABEL_WIDTH = 24
const MIN_CELL = 10

// Jan 5, 2025 is a Sunday — matches getDay() convention (0=Sun, 6=Sat)
// Every other row is labeled: Mon, Wed, Fri. Sun/Tue/Thu/Sat are blank.
const DAY_LABELS = Array.from({ length: 7 }, (_, i) =>
    i % 2 === 0
        ? ''
        : new Date(Date.UTC(2025, 0, 5 + i)).toLocaleDateString(undefined, {
              weekday: 'short',
              timeZone: 'UTC',
          })
)

type StreakCell = {
    day: string
    streak: number
    prevStreak: number
    inRange: boolean
}

type TooltipState = { cell: StreakCell; x: number; y: number }

function parseLocalDate(dateStr: string): Date {
    const [y, m, d] = dateStr.split('-').map(Number)
    return new Date(y, m - 1, d)
}

function formatDateStr(date: Date): string {
    const y = date.getFullYear()
    const m = String(date.getMonth() + 1).padStart(2, '0')
    const d = String(date.getDate()).padStart(2, '0')
    return `${y}-${m}-${d}`
}

function addDays(date: Date, n: number): Date {
    const d = new Date(date)
    d.setDate(d.getDate() + n)
    return d
}

function cellColor(cell: StreakCell, maxStreak: number): string | null {
    if (cell.streak > 0)
        return `rgba(34,197,94,${Math.max(0.2, cell.streak / maxStreak)})`
    if (cell.streak === 0 && cell.prevStreak > 0 && cell.inRange)
        return 'rgba(239,68,68,0.45)'
    // in-range non-played: null signals "use gray class"
    if (cell.inRange) return null
    return 'transparent'
}

function isVisible(cell: StreakCell): boolean {
    return (
        cell.streak > 0 ||
        (cell.streak === 0 && cell.prevStreak > 0 && cell.inRange)
    )
}

function formatDisplayDate(day: string): string {
    return new Date(day + 'T00:00:00').toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
    })
}

type Props = {
    data: StreaksQueryResult[] | undefined
    year: number | undefined
    isLatestYear: boolean
    isLoading?: boolean
}

export function StreaksView({ data, year, isLatestYear, isLoading }: Props) {
    const scrollRef = useRef<HTMLDivElement>(null)
    const [tooltip, setTooltip] = useState<TooltipState | null>(null)

    const { cells, maxStreak, bestStreakEnd, bestStreakStart, currentStreak } =
        useMemo(() => {
            if (!data || data.length === 0)
                return {
                    cells: [] as StreakCell[],
                    maxStreak: 0,
                    bestStreakEnd: '',
                    bestStreakStart: '',
                    currentStreak: 0,
                }

            const playedSet = new Set(data.map((r) => r.stream_date))
            const playedDates = [...playedSet].sort()
            const firstPlayed = playedDates[0]
            const lastPlayed = playedDates[playedDates.length - 1]

            const rangeStart =
                year !== undefined ? `${year}-01-01` : firstPlayed
            const rangeEnd = year !== undefined ? `${year}-12-31` : lastPlayed

            const cells: StreakCell[] = []
            const cur = parseLocalDate(rangeStart)
            const end = parseLocalDate(rangeEnd)
            let streak = 0
            let maxStreak = 0
            let bestStreakEnd = ''

            while (cur <= end) {
                const day = formatDateStr(cur)
                const prevStreak = streak
                streak = playedSet.has(day) ? prevStreak + 1 : 0
                const inRange =
                    year !== undefined
                        ? day >= firstPlayed && day <= lastPlayed
                        : true
                cells.push({ day, streak, prevStreak, inRange })
                if (streak > maxStreak) {
                    maxStreak = streak
                    bestStreakEnd = day
                }
                cur.setDate(cur.getDate() + 1)
            }

            const currentStreak = cells[cells.length - 1]?.streak ?? 0

            let bestStreakStart = ''
            if (bestStreakEnd && maxStreak > 0) {
                bestStreakStart = formatDateStr(
                    addDays(parseLocalDate(bestStreakEnd), -(maxStreak - 1))
                )
            }

            return {
                cells,
                maxStreak,
                bestStreakEnd,
                bestStreakStart,
                currentStreak,
            }
        }, [data, year])

    const { weeks, monthLabels, weekCount } = useMemo(() => {
        if (cells.length === 0)
            return {
                weeks: [] as Array<Array<StreakCell | null>>,
                monthLabels: [] as Array<{ weekIdx: number; label: string }>,
                weekCount: 0,
            }

        const cellMap = new Map(cells.map((c) => [c.day, c]))

        const firstDate = parseLocalDate(cells[0].day)
        const lastDate = parseLocalDate(cells[cells.length - 1].day)

        const gridStart = new Date(firstDate)
        gridStart.setDate(gridStart.getDate() - gridStart.getDay())

        const gridEnd = new Date(lastDate)
        gridEnd.setDate(gridEnd.getDate() + (6 - gridEnd.getDay()))

        const totalDays =
            Math.round((gridEnd.getTime() - gridStart.getTime()) / 86400000) + 1
        const weekCount = totalDays / 7

        const weeks: Array<Array<StreakCell | null>> = []
        for (let wi = 0; wi < weekCount; wi++) {
            const week: Array<StreakCell | null> = []
            for (let di = 0; di < 7; di++) {
                const day = formatDateStr(addDays(gridStart, wi * 7 + di))
                week.push(cellMap.get(day) ?? null)
            }
            weeks.push(week)
        }

        const monthLabels: Array<{ weekIdx: number; label: string }> = []
        let lastMonth = -1
        let lastYear = -1
        for (let wi = 0; wi < weeks.length; wi++) {
            const firstCell = weeks[wi].find((c) => c !== null)
            if (!firstCell) continue
            const date = parseLocalDate(firstCell.day)
            const m = date.getMonth()
            const y = date.getFullYear()
            if (m !== lastMonth) {
                const showYear = y !== lastYear
                const monthStr = date.toLocaleDateString(undefined, {
                    month: 'short',
                })
                monthLabels.push({
                    weekIdx: wi,
                    label: showYear
                        ? `${monthStr} '${String(y).slice(2)}`
                        : monthStr,
                })
                lastMonth = m
                lastYear = y
            }
        }

        return { weeks, monthLabels, weekCount }
    }, [cells])

    useEffect(() => {
        const el = scrollRef.current
        if (!el) return
        if (year === undefined) {
            el.scrollLeft = el.scrollWidth
        } else {
            el.scrollLeft = 0
        }
    }, [year, cells])

    const isEmpty = !data || data.length === 0
    const minGridWidth = LABEL_WIDTH + weekCount * (MIN_CELL + CELL_GAP)
    const colTemplate = `${LABEL_WIDTH}px repeat(${weekCount}, 1fr)`

    return (
        <ChartCard
            title="Listening Streaks"
            emoji="🔥"
            question="How consistent is your listening?"
            isLoading={isLoading}
        >
            {isEmpty ? (
                <ChartCardEmpty />
            ) : (
                <>
                    <div
                        ref={scrollRef}
                        className="overflow-x-auto overflow-y-hidden"
                        onMouseLeave={() => setTooltip(null)}
                    >
                        <div style={{ minWidth: `${minGridWidth}px` }}>
                            {/* Month labels */}
                            <div
                                style={{
                                    display: 'grid',
                                    gridTemplateColumns: colTemplate,
                                    marginBottom: 2,
                                }}
                            >
                                <div />
                                {Array.from({ length: weekCount }, (_, wi) => {
                                    const label = monthLabels.find(
                                        (ml) => ml.weekIdx === wi
                                    )
                                    return (
                                        <div
                                            key={wi}
                                            className="text-[9px] text-gray-400 dark:text-gray-600"
                                        >
                                            {label?.label ?? ''}
                                        </div>
                                    )
                                })}
                            </div>

                            {/* Calendar grid */}
                            <div
                                style={{
                                    display: 'grid',
                                    gridTemplateColumns: colTemplate,
                                    gridTemplateRows: 'repeat(7, auto)',
                                    gap: `${CELL_GAP}px`,
                                }}
                            >
                                {DAY_LABELS.map((label, di) => (
                                    <div
                                        key={`label-${di}`}
                                        style={{
                                            gridColumn: 1,
                                            gridRow: di + 1,
                                        }}
                                        className="text-[8px] flex items-center justify-end pr-1 text-gray-400 dark:text-gray-600"
                                    >
                                        {label}
                                    </div>
                                ))}

                                {weeks.flatMap((week, wi) =>
                                    week.map((cell, di) => {
                                        const testId = cell
                                            ? cell.streak > 0
                                                ? 'streak-cell-active'
                                                : cell.prevStreak > 0 &&
                                                    cell.inRange
                                                  ? 'streak-cell-break'
                                                  : undefined
                                            : undefined
                                        const color = cell
                                            ? cellColor(cell, maxStreak)
                                            : 'transparent'
                                        return (
                                            <div
                                                key={`${wi}-${di}`}
                                                data-testid={testId}
                                                style={{
                                                    gridColumn: wi + 2,
                                                    gridRow: di + 1,
                                                    aspectRatio: '1',
                                                    backgroundColor:
                                                        color ?? undefined,
                                                }}
                                                className={`rounded-xs ${color === null ? 'bg-gray-100 dark:bg-slate-700/50' : ''}`}
                                                onMouseEnter={
                                                    cell && isVisible(cell)
                                                        ? (e) => {
                                                              const rect =
                                                                  e.currentTarget.getBoundingClientRect()
                                                              setTooltip({
                                                                  cell,
                                                                  x:
                                                                      rect.left +
                                                                      rect.width /
                                                                          2,
                                                                  y: rect.top,
                                                              })
                                                          }
                                                        : undefined
                                                }
                                            />
                                        )
                                    })
                                )}
                            </div>
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
                                Best streak
                            </span>
                            <span className="font-bold text-sm">
                                {maxStreak} day{maxStreak === 1 ? '' : 's'}
                                {bestStreakStart && bestStreakEnd && (
                                    <span className="font-normal text-gray-500 dark:text-gray-400">
                                        {' '}
                                        &middot;{' '}
                                        {formatDisplayDate(
                                            bestStreakStart
                                        )}{' '}
                                        &ndash;{' '}
                                        {formatDisplayDate(bestStreakEnd)}
                                    </span>
                                )}
                            </span>
                        </li>
                        {isLatestYear && (
                            <li
                                className="flex justify-between items-center mt-1"
                                role="listitem"
                            >
                                <span className="text-sm text-gray-600 dark:text-gray-400">
                                    Current streak
                                </span>
                                <span className="font-bold text-sm">
                                    {currentStreak} day
                                    {currentStreak === 1 ? '' : 's'}
                                </span>
                            </li>
                        )}
                    </ul>
                </>
            )}
            {tooltip && (
                <ChartTooltip x={tooltip.x} y={tooltip.y}>
                    <div className="font-semibold">
                        {formatDisplayDate(tooltip.cell.day)}
                    </div>
                    <div className="text-gray-300 dark:text-gray-400">
                        {tooltip.cell.streak > 0
                            ? `Day ${tooltip.cell.streak} of streak`
                            : 'Streak broken'}
                    </div>
                </ChartTooltip>
            )}
        </ChartCard>
    )
}
