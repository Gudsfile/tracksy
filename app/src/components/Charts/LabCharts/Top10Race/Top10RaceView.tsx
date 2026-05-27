import { useMemo } from 'react'
import type { Top10RaceQueryResult } from './query'
import type { EntityType } from '../shared/types'
import { BAR_CHART_COLORS } from '../barChartColors'
import { RaceControlBar } from '../Common/RaceControlBar'
import { useRacePlayback } from '../Common/useRacePlayback'

type Props = {
    data: Top10RaceQueryResult[]
    entityType: EntityType
}

type EntityScore = {
    label: string
    play_count: number
}

type Frame = {
    dateTs: number
    top10: EntityScore[]
    maxScore: number
}

const BASE_SPEED = 120
const BAR_STRIDE = 44
const STREAMS_COL_WIDTH = 60

export function Top10RaceView({ data, entityType }: Props) {
    const { frames, entityColors } = useMemo(() => {
        const uniqueDates = Array.from(
            new Set(data.map((d) => d.stream_date_ts))
        ).sort((a, b) => a - b)

        const currentScores = new Map<string, number>()
        const allFrames: Frame[] = []
        const colorMap = new Map<string, string>()
        let colorIdx = 0

        const dataByDate = new Map<number, typeof data>()
        for (const row of data) {
            if (!dataByDate.has(row.stream_date_ts)) {
                dataByDate.set(row.stream_date_ts, [])
            }
            dataByDate.get(row.stream_date_ts)!.push(row)
        }

        for (const dateTs of uniqueDates) {
            const dayEvents = dataByDate.get(dateTs) || []
            for (const event of dayEvents) {
                currentScores.set(event.entity_name, event.play_count)
                if (!colorMap.has(event.entity_name)) {
                    colorMap.set(
                        event.entity_name,
                        BAR_CHART_COLORS[colorIdx % BAR_CHART_COLORS.length]
                    )
                    colorIdx++
                }
            }

            const sortedEntities = Array.from(currentScores.entries())
                .sort((a, b) => b[1] - a[1])
                .slice(0, 10)

            allFrames.push({
                dateTs,
                top10: sortedEntities.map(([label, play_count]) => ({
                    label,
                    play_count,
                })),
                maxScore: Math.max(1, sortedEntities[0]?.[1] || 1),
            })
        }

        return { frames: allFrames, entityColors: colorMap }
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
        entityType,
    })

    const currentFrame = frames[currentFrameIdx]

    if (!currentFrame) return null

    return (
        <div ref={containerRef} className="flex flex-col gap-4 w-full">
            <h4 className="text-2xl font-bold font-mono tracking-tight text-gray-800 dark:text-gray-100">
                {new Date(currentFrame.dateTs).toLocaleDateString(undefined, {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                })}
                <span className="text-sm font-normal text-gray-400 dark:text-gray-500 ml-2 font-sans">
                    · daily
                </span>
            </h4>

            <div
                className="flex justify-end"
                style={{ paddingRight: STREAMS_COL_WIDTH }}
            >
                <span className="text-xs text-gray-400 dark:text-gray-500 font-mono">
                    streams
                </span>
            </div>

            <div
                className="relative w-full"
                style={{ height: currentFrame.top10.length * BAR_STRIDE }}
            >
                {currentFrame.top10.map((item, index) => {
                    const widthPercent =
                        (item.play_count / currentFrame.maxScore) * 100
                    const topPos = index * BAR_STRIDE

                    return (
                        <div
                            key={item.label}
                            className="absolute left-0 flex items-center w-full transition-all duration-300 ease-linear"
                            style={{
                                top: `${topPos}px`,
                                zIndex: 10 - index,
                            }}
                        >
                            <div className="w-full relative h-9">
                                <div
                                    className={`absolute top-0 left-0 h-full rounded-r-md transition-all duration-300 ease-linear ${entityColors.get(item.label)}`}
                                    style={{
                                        width: `${widthPercent}%`,
                                        opacity: 0.8,
                                    }}
                                />
                                <div
                                    className="absolute left-2 h-full flex items-center font-medium text-sm text-gray-900 dark:text-white drop-shadow-md whitespace-nowrap overflow-hidden text-ellipsis"
                                    style={{ width: 'calc(100% - 16px)' }}
                                >
                                    <span className="font-bold w-6 text-right mr-2 opacity-70">
                                        #{index + 1}
                                    </span>
                                    {item.label}
                                </div>
                            </div>
                            <div
                                className="ml-2 text-sm font-mono text-gray-600 dark:text-gray-300 transition-all duration-300 ease-linear"
                                style={{ minWidth: STREAMS_COL_WIDTH }}
                            >
                                {item.play_count.toLocaleString()}
                            </div>
                        </div>
                    )
                })}
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
    )
}
