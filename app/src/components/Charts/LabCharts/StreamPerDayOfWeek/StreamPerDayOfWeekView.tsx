import { Fragment, useMemo } from 'react'
import type { StreamPerDayOfWeekQueryResult } from './query'
import { ChartCard } from '../../SimpleCharts/shared'
import { RaceControlBar } from '../Common/RaceControlBar'
import { useRacePlayback } from '../Common/useRacePlayback'

const CELL_GAP = 3
const LABEL_WIDTH = 24
const MIN_CELL_WIDTH = 10
const TOTAL_WIDTH = 40
const BASE_SPEED = 120

const DAY_LABELS = ['', 'Mon', '', 'Wed', '', 'Fri', '']
const HOUR_LABELS = Array.from({ length: 24 }, (_, h) =>
    h % 6 === 0 ? String(h) : ''
)

type BingoFrame = {
    dateTs: number
    cells: Map<string, number>
}

type Props = {
    data: StreamPerDayOfWeekQueryResult[] | undefined
    year: number | undefined
    isLoading?: boolean
}

export function StreamPerDayOfWeekView({ data, year, isLoading }: Props) {
    const { frames, maxCount, topDay, topHour } = useMemo(() => {
        if (!data || data.length === 0)
            return {
                frames: [] as BingoFrame[],
                maxCount: 1,
                topDay: -1,
                topHour: -1,
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

        for (const dateTs of uniqueDates) {
            for (const row of byDate.get(dateTs) ?? []) {
                cellState.set(
                    `${row.day_of_week},${row.play_hour}`,
                    row.cumulative_count
                )
            }
            allFrames.push({ dateTs, cells: new Map(cellState) })
        }

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
                </div>
            </ChartCard>
        </div>
    )
}
