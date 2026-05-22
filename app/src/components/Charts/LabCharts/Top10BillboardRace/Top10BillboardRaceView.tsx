import { useEffect, useState, useMemo, useRef } from 'react'
import type { EntityType, Top10BillboardRaceQueryResult } from './query'
import { GhostLeaderboard } from './GhostLeaderboard'

type Props = {
    data: Top10BillboardRaceQueryResult[]
    entityType: EntityType
}

type EntityScore = {
    label: string
    score: number // decay score (bar width)
    periodsInTop10: number
    streak: number
}

type GhostEntry = {
    label: string
    periodsInTop10: number
    streak: number
}

type Frame = {
    periodTs: number
    top10: EntityScore[]
    maxScore: number
    ghostRanking: GhostEntry[]
}

// Helper to assign consistent colors to entities
const colors = [
    'bg-blue-500',
    'bg-red-500',
    'bg-green-500',
    'bg-yellow-500',
    'bg-purple-500',
    'bg-pink-500',
    'bg-indigo-500',
    'bg-teal-500',
    'bg-orange-500',
    'bg-cyan-500',
]

export function Top10BillboardRaceView({ data, entityType }: Props) {
    const [currentFrameIdx, setCurrentFrameIdx] = useState(0)
    const [isPlaying, setIsPlaying] = useState(false)
    const [speedMultiplier, setSpeedMultiplier] = useState(1) // 0.5x, 1x, 2x, 4x
    const [lambda, setLambda] = useState(0.4)
    const [isVisible, setIsVisible] = useState(false)
    const containerRef = useRef<HTMLDivElement>(null)

    // Base speed in ms
    const BASE_SPEED = 120

    // Precompute all frames from the event stream using exponential decay scoring
    const { frames, entityColors } = useMemo(() => {
        const uniquePeriods = [...new Set(data.map((d) => d.period_ts))].sort(
            (a, b) => a - b
        )
        const decay = Math.exp(-lambda)

        // Group data by period
        const dataByPeriod = new Map<
            number,
            { label: string; plays: number }[]
        >()
        for (const row of data) {
            if (!dataByPeriod.has(row.period_ts))
                dataByPeriod.set(row.period_ts, [])
            dataByPeriod.get(row.period_ts)!.push({
                label: row.entity_name,
                plays: row.period_plays,
            })
        }

        const runningScores = new Map<string, number>()
        const periodsInTop10 = new Map<string, number>()
        const streakMap = new Map<string, number>()
        const colorMap = new Map<string, string>()
        let colorIdx = 0
        const allFrames: Frame[] = []

        for (const periodTs of uniquePeriods) {
            // Decay all existing scores
            for (const [label, score] of runningScores) {
                runningScores.set(label, score * decay)
            }

            // Add this week's streams
            for (const { label, plays } of dataByPeriod.get(periodTs) ?? []) {
                runningScores.set(
                    label,
                    (runningScores.get(label) ?? 0) + plays
                )
                if (!colorMap.has(label)) {
                    colorMap.set(label, colors[colorIdx % colors.length])
                    colorIdx++
                }
            }

            // Rank top 10 by decay score
            const ranked = [...runningScores.entries()]
                .filter(([, s]) => s > 0.01)
                .sort((a, b) => b[1] - a[1])
                .slice(0, 10)

            const top10Set = new Set(ranked.map(([l]) => l))

            // Update longevity counters
            for (const [label] of ranked) {
                periodsInTop10.set(label, (periodsInTop10.get(label) ?? 0) + 1)
                streakMap.set(label, (streakMap.get(label) ?? 0) + 1)
            }
            for (const [label] of runningScores) {
                if (!top10Set.has(label) && (streakMap.get(label) ?? 0) > 0) {
                    streakMap.set(label, 0)
                }
            }

            const maxScore = ranked[0]?.[1] ?? 1

            // Ghost ranking: top 10 by total weeks in top 10 at this frame
            const ghostRanking = [...periodsInTop10.entries()]
                .sort((a, b) => b[1] - a[1])
                .slice(0, 10)
                .map(([label, weeks]) => ({
                    label,
                    periodsInTop10: weeks,
                    streak: streakMap.get(label) ?? 0,
                }))

            allFrames.push({
                periodTs,
                top10: ranked.map(([label, score]) => ({
                    label,
                    score,
                    periodsInTop10: periodsInTop10.get(label) ?? 0,
                    streak: streakMap.get(label) ?? 0,
                })),
                maxScore,
                ghostRanking,
            })
        }

        return { frames: allFrames, entityColors: colorMap }
    }, [data, lambda])

    const currentFrame = frames[currentFrameIdx]

    const activeLabels = useMemo(
        () => new Set(currentFrame?.top10.map((e) => e.label) ?? []),
        [currentFrame]
    )

    // IntersectionObserver to only animate when visible
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

    useEffect(() => {
        setCurrentFrameIdx(0)
        setIsPlaying(true)
    }, [entityType, lambda])

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
            {/* Controls row */}
            <div className="flex items-center justify-between flex-wrap gap-4">
                <h4 className="text-2xl font-bold font-mono tracking-tight text-gray-800 dark:text-gray-100">
                    {'Week of ' +
                        new Date(currentFrame.periodTs).toLocaleDateString(
                            undefined,
                            {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric',
                            }
                        )}
                    <span className="text-sm font-normal text-gray-400 dark:text-gray-500 ml-2 font-sans">
                        · weekly
                    </span>
                </h4>
                <div className="flex items-center gap-4 flex-wrap">
                    {/* λ selector */}
                    <div className="flex items-center bg-gray-100 dark:bg-slate-800/80 rounded-lg p-1 border border-gray-300/30">
                        {([0.1, 0.2, 0.3, 0.4, 0.5] as const).map((l) => (
                            <button
                                key={l}
                                onClick={() => setLambda(l)}
                                className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-all ${
                                    lambda === l
                                        ? 'bg-blue-500 text-white shadow-sm'
                                        : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
                                }`}
                            >
                                λ{l}
                            </button>
                        ))}
                    </div>

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

                    {/* Play/Pause */}
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

            {/* Timeline slider */}
            {frames.length > 1 && (
                <div className="flex items-center gap-3 w-full bg-gray-50/50 dark:bg-slate-800/20 p-2.5 rounded-xl border border-gray-200/50 dark:border-slate-800/50">
                    <span className="text-xs text-gray-500 dark:text-gray-400 font-mono select-none">
                        {new Date(frames[0].periodTs).toLocaleDateString(
                            undefined,
                            { year: 'numeric', month: 'short' }
                        )}
                    </span>
                    <input
                        type="range"
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
                            frames[frames.length - 1].periodTs
                        ).toLocaleDateString(undefined, {
                            year: 'numeric',
                            month: 'short',
                        })}
                    </span>
                </div>
            )}

            {/* Two-column layout: Ghost (1/3) | Race (2/3) */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Ghost Leaderboard */}
                <div className="md:col-span-1 border-b md:border-b-0 md:border-r border-gray-200 dark:border-slate-700/50 pb-4 md:pb-0 md:pr-6">
                    <GhostLeaderboard
                        ranking={currentFrame.ghostRanking}
                        activeLabels={activeLabels}
                    />
                </div>

                {/* Bar chart race */}
                <div className="md:col-span-2 flex flex-col">
                    <div className="flex justify-end pr-[62px]">
                        <span className="text-xs text-gray-400 dark:text-gray-500 font-mono">
                            score
                        </span>
                    </div>

                    <div className="relative h-[450px] w-full mt-4">
                        {currentFrame.top10.map((item, index) => {
                            const widthPercent =
                                (item.score / currentFrame.maxScore) * 100
                            const topPos = index * 44

                            return (
                                <div
                                    key={item.label}
                                    title={`${item.periodsInTop10} weeks in top 10`}
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
                                            style={{
                                                width: 'calc(100% - 16px)',
                                            }}
                                        >
                                            <span className="font-bold w-6 text-right mr-2 opacity-70">
                                                #{index + 1}
                                            </span>
                                            {item.label}
                                        </div>
                                    </div>
                                    <div className="ml-2 min-w-[62px] text-sm font-mono text-right text-gray-600 dark:text-gray-300 transition-all duration-300 ease-linear">
                                        {Math.round(
                                            item.score
                                        ).toLocaleString()}
                                    </div>
                                </div>
                            )
                        })}
                    </div>

                    <p className="text-[10px] text-gray-400 dark:text-gray-600 text-center mt-2">
                        Score = Σ streams × e^(−λ×Δweeks) · Higher λ = faster
                        decay
                    </p>
                </div>
            </div>
        </div>
    )
}
