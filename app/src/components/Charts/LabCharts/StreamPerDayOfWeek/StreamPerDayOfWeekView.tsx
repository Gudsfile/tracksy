import { Fragment, type ReactNode, useMemo, useState } from 'react'
import type { StreamPerDayOfWeekQueryResult } from './query'
import { ChartCard, ChartTooltip } from '../../SimpleCharts/shared'
import { RaceControlBar } from '../Common/RaceControlBar'
import { useRacePlayback } from '../Common/useRacePlayback'

const CELL_GAP = 3
const LABEL_WIDTH = 24
const MIN_CELL_WIDTH = 10
const TOTAL_WIDTH = 40
const BASE_SPEED = 120

const DAY_LABELS = ['', 'Mon', '', 'Wed', '', 'Fri', '']
// Jan 5, 2025 is a Sunday (dayofweek=0); UTC timezone avoids offset edge cases
const DAY_NAMES = Array.from({ length: 7 }, (_, i) =>
    new Date(Date.UTC(2025, 0, 5 + i)).toLocaleDateString(undefined, {
        weekday: 'long',
        timeZone: 'UTC',
    })
)
const HOUR_LABELS = Array.from({ length: 24 }, (_, h) =>
    h % 6 === 0 ? String(h) : ''
)

type BingoFrame = {
    dateTs: number
    cells: Map<string, number>
}

type TooltipState = {
    x: number
    y: number
    day: number
    hour: number
    count: number
    firstPlayedTs: number | null
}

type Props = {
    data: StreamPerDayOfWeekQueryResult[] | undefined
    year: number | undefined
    isLoading?: boolean
}

export function StreamPerDayOfWeekView({ data, year, isLoading }: Props) {
    const {
        frames,
        maxCount,
        topDay,
        topHour,
        firstPlayedByCell,
        firstCompleteHourFrame,
        firstCompleteHourLabel,
        firstCompleteDayFrame,
        firstCompleteDayLabel,
        bingoFrame,
        uncoveredCells,
    } = useMemo(() => {
        if (!data || data.length === 0)
            return {
                frames: [] as BingoFrame[],
                maxCount: 1,
                topDay: -1,
                topHour: -1,
                firstPlayedByCell: new Map<string, number>(),
                firstCompleteHourFrame: null,
                firstCompleteHourLabel: '',
                firstCompleteDayFrame: null,
                firstCompleteDayLabel: '',
                bingoFrame: null,
                uncoveredCells: 168,
            }

        const uniqueDates = [
            ...new Set(data.map((r) => r.stream_date_ts)),
        ].sort((a, b) => a - b)

        const byDate = new Map<number, StreamPerDayOfWeekQueryResult[]>()
        for (const row of data) {
            if (!byDate.has(row.stream_date_ts))
                byDate.set(row.stream_date_ts, [])
            byDate.get(row.stream_date_ts)!.push(row)
        }

        const cellState = new Map<string, number>()
        const allFrames: BingoFrame[] = []

        const firstPlayedByCell = new Map<string, number>()
        const hourSeenDays = new Map<number, Set<number>>()
        const daySeenHours = new Map<number, Set<number>>()
        let totalRevealed = 0

        let firstCompleteHourFrame: number | null = null
        let firstCompleteHourLabel = ''
        let firstCompleteDayFrame: number | null = null
        let firstCompleteDayLabel = ''
        let bingoFrame: number | null = null

        for (let fi = 0; fi < uniqueDates.length; fi++) {
            const dateTs = uniqueDates[fi]
            const rows = byDate.get(dateTs) ?? []

            for (const row of rows) {
                const key = `${row.day_of_week},${row.play_hour}`
                if (!cellState.has(key)) {
                    firstPlayedByCell.set(key, dateTs)
                    totalRevealed++

                    const d = row.day_of_week
                    const h = row.play_hour

                    if (!hourSeenDays.has(h)) hourSeenDays.set(h, new Set())
                    hourSeenDays.get(h)!.add(d)

                    if (!daySeenHours.has(d)) daySeenHours.set(d, new Set())
                    daySeenHours.get(d)!.add(h)
                }
                cellState.set(key, row.cumulative_count)
            }

            allFrames.push({ dateTs, cells: new Map(cellState) })

            if (firstCompleteHourFrame === null) {
                for (const [h, days] of hourSeenDays) {
                    if (days.size === 7) {
                        firstCompleteHourFrame = fi
                        firstCompleteHourLabel = `${h}h · ${new Date(dateTs).toLocaleDateString()}`
                        break
                    }
                }
            }

            if (firstCompleteDayFrame === null) {
                for (const [d, hours] of daySeenHours) {
                    if (hours.size === 24) {
                        firstCompleteDayFrame = fi
                        firstCompleteDayLabel = `${DAY_NAMES[d]} · ${new Date(dateTs).toLocaleDateString()}`
                        break
                    }
                }
            }

            if (bingoFrame === null && totalRevealed === 168) {
                bingoFrame = fi
            }
        }

        const uncoveredCells = 168 - totalRevealed

        const lastCells = allFrames[allFrames.length - 1].cells
        const computedMax = Math.max(1, ...lastCells.values())

        const finalDayTotals = Array.from({ length: 7 }, (_, d) => {
            let sum = 0
            for (let h = 0; h < 24; h++) sum += lastCells.get(`${d},${h}`) ?? 0
            return sum
        })
        const finalHourTotals = Array.from({ length: 24 }, (_, h) => {
            let sum = 0
            for (let d = 0; d < 7; d++) sum += lastCells.get(`${d},${h}`) ?? 0
            return sum
        })

        const topDayIdx = finalDayTotals.indexOf(Math.max(...finalDayTotals))
        const topHourIdx = finalHourTotals.indexOf(Math.max(...finalHourTotals))

        return {
            frames: allFrames,
            maxCount: computedMax,
            topDay: topDayIdx,
            topHour: topHourIdx,
            firstPlayedByCell,
            firstCompleteHourFrame,
            firstCompleteHourLabel,
            firstCompleteDayFrame,
            firstCompleteDayLabel,
            bingoFrame,
            uncoveredCells,
        }
    }, [data])

    const {
        containerRef,
        currentFrameIdx,
        isPlaying,
        speedMultiplier,
        onFrameChange,
        onSpeedChange,
        onPlayPause,
    } = useRacePlayback({
        frameCount: frames.length,
        baseSpeed: BASE_SPEED,
        entityType: String(year),
    })

    const currentCells = useMemo(
        () => frames[currentFrameIdx]?.cells ?? new Map<string, number>(),
        [frames, currentFrameIdx]
    )

    const { dayTotals, hourTotals } = useMemo(() => {
        const dt = Array.from({ length: 7 }, (_, d) => {
            let sum = 0
            for (let h = 0; h < 24; h++)
                sum += currentCells.get(`${d},${h}`) ?? 0
            return sum
        })
        const ht = Array.from({ length: 24 }, (_, h) => {
            let sum = 0
            for (let d = 0; d < 7; d++)
                sum += currentCells.get(`${d},${h}`) ?? 0
            return sum
        })
        return { dayTotals: dt, hourTotals: ht }
    }, [currentCells])

    const [tooltip, setTooltip] = useState<TooltipState | null>(null)

    let bingoValue: ReactNode = null
    if (bingoFrame !== null && currentFrameIdx >= bingoFrame) {
        bingoValue = (
            <span className="font-bold text-sm">
                {new Date(frames[bingoFrame].dateTs).toLocaleDateString()}
            </span>
        )
    } else if (
        bingoFrame === null &&
        frames.length > 0 &&
        currentFrameIdx >= frames.length - 1
    ) {
        bingoValue = (
            <span className="text-sm text-gray-500">
                {uncoveredCells} cells uncovered
            </span>
        )
    }

    return (
        <div ref={containerRef}>
            <ChartCard
                title="Listening Bingo"
                emoji="🎰"
                question="Have you listened at every hour of every day?"
                isLoading={isLoading}
            >
                <div className="flex flex-col gap-3">
                    <div className="overflow-x-auto">
                        <div
                            style={{
                                display: 'grid',
                                gridTemplateColumns: `${LABEL_WIDTH}px repeat(24, 1fr) ${TOTAL_WIDTH}px`,
                                gap: `${CELL_GAP}px`,
                                minWidth: `${LABEL_WIDTH + 24 * (CELL_GAP + MIN_CELL_WIDTH) + TOTAL_WIDTH}px`,
                            }}
                            onMouseLeave={() => setTooltip(null)}
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
                            <div className="text-[8px] text-right text-gray-400 dark:text-gray-600 pl-1 border-l border-gray-200 dark:border-gray-700">
                                TOTAL
                            </div>

                            {/* Day rows */}
                            {DAY_LABELS.map((dayLabel, d) => (
                                <Fragment key={d}>
                                    <div className="text-[8px] flex items-center justify-end pr-1 text-gray-400 dark:text-gray-600">
                                        {dayLabel}
                                    </div>
                                    {Array.from({ length: 24 }, (_, h) => {
                                        const count =
                                            currentCells.get(`${d},${h}`) ?? 0
                                        const revealed = count > 0
                                        return (
                                            <div
                                                key={`${h}-${count}`}
                                                style={{
                                                    aspectRatio: '1',
                                                    ...(revealed && {
                                                        backgroundColor: `rgba(20, 184, 166, ${Math.max(0.15, count / maxCount)})`,
                                                        animation:
                                                            'cellPop 0.2s ease-out',
                                                    }),
                                                }}
                                                className={`rounded-xs ${revealed ? '' : 'bg-slate-200/50 dark:bg-slate-700/30'}`}
                                                onMouseEnter={(e) => {
                                                    const rect =
                                                        e.currentTarget.getBoundingClientRect()
                                                    setTooltip({
                                                        x:
                                                            rect.left +
                                                            rect.width / 2,
                                                        y: rect.top,
                                                        day: d,
                                                        hour: h,
                                                        count,
                                                        firstPlayedTs: revealed
                                                            ? (firstPlayedByCell.get(
                                                                  `${d},${h}`
                                                              ) ?? null)
                                                            : null,
                                                    })
                                                }}
                                            />
                                        )
                                    })}
                                    <div
                                        data-testid={`day-total-${d}`}
                                        className={`text-[8px] text-right flex items-center justify-end pl-1 border-l border-gray-200 dark:border-gray-700 font-medium ${d === topDay ? 'text-teal-500' : 'text-gray-500 dark:text-gray-400'}`}
                                    >
                                        {dayTotals[d] > 0 ? dayTotals[d] : ''}
                                    </div>
                                </Fragment>
                            ))}

                            {/* Hour totals row */}
                            <div className="text-[8px] flex items-center justify-end pr-1 text-gray-400 dark:text-gray-600">
                                TOT
                            </div>
                            {hourTotals.map((total, h) => (
                                <div
                                    key={h}
                                    data-testid={`hour-total-${h}`}
                                    className={`text-[8px] text-center font-medium ${h === topHour ? 'text-teal-500' : 'text-gray-500 dark:text-gray-400'}`}
                                >
                                    {total > 0 ? total : ''}
                                </div>
                            ))}
                            <div />
                        </div>
                    </div>

                    {frames.length > 1 && (
                        <RaceControlBar
                            frameCount={frames.length}
                            startTs={frames[0].dateTs}
                            endTs={frames[frames.length - 1].dateTs}
                            currentFrameIdx={currentFrameIdx}
                            speedMultiplier={speedMultiplier}
                            isPlaying={isPlaying}
                            onFrameChange={onFrameChange}
                            onSpeedChange={onSpeedChange}
                            onPlayPause={onPlayPause}
                        />
                    )}

                    <ul
                        className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700"
                        role="list"
                    >
                        <li
                            className="flex justify-between items-center"
                            role="listitem"
                        >
                            <span className="text-sm text-gray-600 dark:text-gray-400">
                                First complete hour
                            </span>
                            {firstCompleteHourFrame !== null &&
                                currentFrameIdx >= firstCompleteHourFrame && (
                                    <span className="font-bold text-sm">
                                        {firstCompleteHourLabel}
                                    </span>
                                )}
                        </li>
                        <li
                            className="flex justify-between items-center mt-1"
                            role="listitem"
                        >
                            <span className="text-sm text-gray-600 dark:text-gray-400">
                                First complete day
                            </span>
                            {firstCompleteDayFrame !== null &&
                                currentFrameIdx >= firstCompleteDayFrame && (
                                    <span className="font-bold text-sm">
                                        {firstCompleteDayLabel}
                                    </span>
                                )}
                        </li>
                        <li
                            className="flex justify-between items-center mt-1"
                            role="listitem"
                        >
                            <span className="text-sm text-gray-600 dark:text-gray-400">
                                Bingo
                            </span>
                            {bingoValue}
                        </li>
                    </ul>
                </div>
                {tooltip && (
                    <ChartTooltip x={tooltip.x} y={tooltip.y}>
                        <div className="font-semibold">
                            {DAY_NAMES[tooltip.day]} {tooltip.hour}h
                        </div>
                        <div className="text-gray-300 dark:text-gray-400">
                            {tooltip.count.toLocaleString()} streams
                        </div>
                        {tooltip.firstPlayedTs !== null && (
                            <div className="text-gray-300 dark:text-gray-400">
                                first played{' '}
                                {new Date(
                                    tooltip.firstPlayedTs
                                ).toLocaleDateString()}
                            </div>
                        )}
                    </ChartTooltip>
                )}
            </ChartCard>
        </div>
    )
}
