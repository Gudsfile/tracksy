import { useEffect, useState, useMemo, useRef } from 'react'
import type { EntityType, Top10RaceQueryResult } from './query'
import { BAR_CHART_COLORS } from '../barChartColors'

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
    const [currentFrameIdx, setCurrentFrameIdx] = useState(0)
    const [isPlaying, setIsPlaying] = useState(false)
    const [speedMultiplier, setSpeedMultiplier] = useState(1)
    const [isVisible, setIsVisible] = useState(false)
    const containerRef = useRef<HTMLDivElement>(null)

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

    const currentFrame = frames[currentFrameIdx]

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                setIsVisible(entry.isIntersecting)
            },
            { threshold: 0.1 }
        )

        const currentRef = containerRef.current
        if (currentRef) {
            observer.observe(currentRef)
        }

        return () => {
            if (currentRef) {
                observer.unobserve(currentRef)
            }
        }
    }, [])

    const hasInitialized = useRef(false)
    useEffect(() => {
        if (!hasInitialized.current) {
            hasInitialized.current = true
            return
        }
        setCurrentFrameIdx(0)
        setIsPlaying(true)
    }, [entityType])

    useEffect(() => {
        if (!isPlaying || !isVisible || frames.length === 0) return

        const interval = setInterval(() => {
            setCurrentFrameIdx((prev) => {
                if (prev >= frames.length - 1) {
                    setIsPlaying(false)
                    return prev
                }
                return prev + 1
            })
        }, BASE_SPEED / speedMultiplier)

        return () => clearInterval(interval)
    }, [isPlaying, isVisible, frames.length, speedMultiplier])

    if (!currentFrame) return null

    return (
        <div ref={containerRef} className="flex flex-col gap-4 w-full">
            <div className="flex items-center justify-between flex-wrap gap-4">
                <h4 className="text-2xl font-bold font-mono tracking-tight text-gray-800 dark:text-gray-100">
                    {new Date(currentFrame.dateTs).toLocaleDateString(
                        undefined,
                        { year: 'numeric', month: 'long', day: 'numeric' }
                    )}
                    <span className="text-sm font-normal text-gray-400 dark:text-gray-500 ml-2 font-sans">
                        · daily
                    </span>
                </h4>
                <div className="flex items-center gap-4 flex-wrap">
                    {/* Speed selector */}
                    <div className="flex items-center bg-gray-100 dark:bg-slate-800/80 rounded-lg p-1 border border-gray-300/30">
                        {([0.5, 1, 2, 4] as const).map((speed) => (
                            <button
                                key={speed}
                                onClick={() => setSpeedMultiplier(speed)}
                                className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-all ${
                                    speedMultiplier === speed
                                        ? 'bg-blue-500 text-white shadow-sm'
                                        : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
                                }`}
                            >
                                {speed}x
                            </button>
                        ))}
                    </div>

                    {/* Controls (Play/Pause) */}
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => {
                                if (currentFrameIdx >= frames.length - 1) {
                                    setCurrentFrameIdx(0)
                                    setIsPlaying(true)
                                } else {
                                    setIsPlaying(!isPlaying)
                                }
                            }}
                            aria-label={
                                isPlaying
                                    ? 'Pause'
                                    : currentFrameIdx >= frames.length - 1
                                      ? 'Replay'
                                      : 'Play'
                            }
                            title={
                                isPlaying
                                    ? 'Pause'
                                    : currentFrameIdx >= frames.length - 1
                                      ? 'Replay'
                                      : 'Play'
                            }
                            className="p-2 bg-gray-200 dark:bg-slate-700 hover:bg-gray-300 dark:hover:bg-slate-600 rounded-lg transition-colors"
                        >
                            {isPlaying ? (
                                <svg
                                    width="16"
                                    height="16"
                                    viewBox="0 0 16 16"
                                    fill="currentColor"
                                >
                                    <rect
                                        x="3"
                                        y="2"
                                        width="4"
                                        height="12"
                                        rx="1"
                                    />
                                    <rect
                                        x="9"
                                        y="2"
                                        width="4"
                                        height="12"
                                        rx="1"
                                    />
                                </svg>
                            ) : currentFrameIdx >= frames.length - 1 ? (
                                <svg
                                    width="16"
                                    height="16"
                                    viewBox="0 0 16 16"
                                    fill="currentColor"
                                >
                                    <path d="M8 3a5 5 0 1 0 4.546 2.914.5.5 0 0 1 .908-.417A6 6 0 1 1 8 2v1z" />
                                    <path d="M8 4.466V.534a.25.25 0 0 1 .41-.192l2.36 1.966c.12.1.12.284 0 .384L8.41 4.658A.25.25 0 0 1 8 4.466z" />
                                </svg>
                            ) : (
                                <svg
                                    width="16"
                                    height="16"
                                    viewBox="0 0 16 16"
                                    fill="currentColor"
                                >
                                    <path d="M11.596 8.697l-6.363 3.692c-.54.313-1.233-.066-1.233-.697V4.308c0-.63.692-1.01 1.233-.696l6.363 3.692a.802.802 0 0 1 0 1.393z" />
                                </svg>
                            )}
                        </button>
                    </div>
                </div>
            </div>

            {frames.length > 1 && (
                <div className="flex items-center gap-3 w-full bg-gray-50/50 dark:bg-slate-800/20 p-2.5 rounded-xl border border-gray-200/50 dark:border-slate-800/50">
                    <span className="text-xs text-gray-500 dark:text-gray-400 font-mono select-none">
                        {new Date(frames[0].dateTs).toLocaleDateString(
                            undefined,
                            { year: 'numeric', month: 'short' }
                        )}
                    </span>
                    <input
                        type="range"
                        aria-label="Animation timeline"
                        min={0}
                        max={frames.length - 1}
                        value={currentFrameIdx}
                        onChange={(e) => {
                            setIsPlaying(false)
                            setCurrentFrameIdx(Number(e.target.value))
                        }}
                        className="flex-grow h-1.5 bg-gray-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
                    />
                    <span className="text-xs text-gray-500 dark:text-gray-400 font-mono select-none">
                        {new Date(
                            frames[frames.length - 1].dateTs
                        ).toLocaleDateString(undefined, {
                            year: 'numeric',
                            month: 'short',
                        })}
                    </span>
                </div>
            )}

            <div
                className="flex justify-end"
                style={{ paddingRight: STREAMS_COL_WIDTH }}
            >
                <span className="text-xs text-gray-400 dark:text-gray-500 font-mono">
                    streams
                </span>
            </div>

            <div
                className="relative w-full mt-4"
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
        </div>
    )
}
