import { Fragment, useMemo } from 'react'
import type { StreamPerDayOfWeekQueryResult } from './query'
import { ChartCard } from '../../SimpleCharts/shared'
import { RaceControlBar } from '../Common/RaceControlBar'
import { useRacePlayback } from '../Common/useRacePlayback'

const CELL_GAP = 3
const LABEL_WIDTH = 24
const MIN_CELL_WIDTH = 10
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
    isLoading?: boolean
}

export function StreamPerDayOfWeekView({ data, isLoading }: Props) {
    const { frames, maxCount } = useMemo(() => {
        if (!data || data.length === 0)
            return { frames: [] as BingoFrame[], maxCount: 1 }

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

        return { frames: allFrames, maxCount: computedMax }
    }, [data])

    const {
        containerRef,
        currentFrameIdx,
        isPlaying,
        speedMultiplier,
        onFrameChange,
        onSpeedChange,
        onPlayPause,
    } = useRacePlayback({ frameCount: frames.length, baseSpeed: BASE_SPEED })

    const currentCells =
        frames[currentFrameIdx]?.cells ?? new Map<string, number>()

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
                                    {Array.from({ length: 24 }, (_, h) => {
                                        const count =
                                            currentCells.get(`${d},${h}`) ?? 0
                                        const revealed = count > 0
                                        return (
                                            <div
                                                key={h}
                                                style={{
                                                    aspectRatio: '1',
                                                    ...(revealed && {
                                                        backgroundColor: `rgba(20, 184, 166, ${Math.max(0.15, count / maxCount)})`,
                                                    }),
                                                }}
                                                className={`rounded-xs ${revealed ? '' : 'bg-slate-200/50 dark:bg-slate-700/30'}`}
                                            />
                                        )
                                    })}
                                </Fragment>
                            ))}
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
