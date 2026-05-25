import { useEffect, useState, useMemo, useRef } from 'react'
import type { EntityType, Top10BillboardRaceQueryResult } from './query'
import { GhostLeaderboard, type GhostEntry } from './GhostLeaderboard'
import { InsightCard } from '../../SimpleCharts/shared'
import { BAR_CHART_COLORS } from '../barChartColors'
import { RaceControlBar } from '../Common/RaceControlBar'

type Props = {
    data: Top10BillboardRaceQueryResult[]
    entityType: EntityType
}

type EntityScore = {
    label: string
    score: number
    periodsInTop10: number
}

type Frame = {
    periodTs: number
    top10: EntityScore[]
    maxScore: number
    ghostRanking: GhostEntry[]
}

const BASE_SPEED = 240
const BAR_STRIDE = 44
const SCORE_COL_WIDTH = 62
const LAMBDA = 0.2

export function Top10BillboardRaceView({ data, entityType }: Props) {
    const [currentFrameIdx, setCurrentFrameIdx] = useState(0)
    const [isPlaying, setIsPlaying] = useState(false)
    const [speedMultiplier, setSpeedMultiplier] = useState(1)
    const [isVisible, setIsVisible] = useState(false)
    const containerRef = useRef<HTMLDivElement>(null)

    const { frames, entityColors, streakRecord } = useMemo(() => {
        const uniquePeriods = [...new Set(data.map((d) => d.period_ts))].sort(
            (a, b) => a - b
        )
        const decay = Math.exp(-LAMBDA)

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
        const allTimeMaxStreakMap = new Map<string, number>()
        const colorMap = new Map<string, string>()
        let colorIdx = 0
        const allFrames: Frame[] = []

        for (const periodTs of uniquePeriods) {
            for (const [label, score] of runningScores) {
                runningScores.set(label, score * decay)
            }

            for (const { label, plays } of dataByPeriod.get(periodTs) ?? []) {
                runningScores.set(
                    label,
                    (runningScores.get(label) ?? 0) + plays
                )
                if (!colorMap.has(label)) {
                    colorMap.set(
                        label,
                        BAR_CHART_COLORS[colorIdx % BAR_CHART_COLORS.length]
                    )
                    colorIdx++
                }
            }

            const ranked = [...runningScores.entries()]
                .filter(([, s]) => s > 0.01)
                .sort((a, b) => b[1] - a[1])
                .slice(0, 10)

            const top10Set = new Set(ranked.map(([l]) => l))

            for (const [label] of ranked) {
                periodsInTop10.set(label, (periodsInTop10.get(label) ?? 0) + 1)
                streakMap.set(label, (streakMap.get(label) ?? 0) + 1)
                const cur = streakMap.get(label)!
                if (cur > (allTimeMaxStreakMap.get(label) ?? 0)) {
                    allTimeMaxStreakMap.set(label, cur)
                }
            }
            for (const [label] of runningScores) {
                if (!top10Set.has(label) && (streakMap.get(label) ?? 0) > 0) {
                    streakMap.set(label, 0)
                }
            }

            const maxScore = ranked[0]?.[1] ?? 1

            const prevGhostRanking =
                allFrames.length > 0
                    ? allFrames[allFrames.length - 1].ghostRanking
                    : []
            const prevRankMap = new Map(
                prevGhostRanking.map((e, i) => [e.label, i])
            )

            const ghostRanking = [...periodsInTop10.entries()]
                .sort((a, b) => b[1] - a[1])
                .slice(0, 10)
                .map(([label, weeks], i) => ({
                    label,
                    periodsInTop10: weeks,
                    rankDelta:
                        prevGhostRanking.length === 0
                            ? null
                            : prevRankMap.has(label)
                              ? prevRankMap.get(label)! - i
                              : null,
                }))

            allFrames.push({
                periodTs,
                top10: ranked.map(([label, score]) => ({
                    label,
                    score,
                    periodsInTop10: periodsInTop10.get(label) ?? 0,
                })),
                maxScore,
                ghostRanking,
            })
        }

        let streakRecord = { label: '', weeks: 0 }
        for (const [label, weeks] of allTimeMaxStreakMap) {
            if (weeks > streakRecord.weeks) streakRecord = { label, weeks }
        }

        return { frames: allFrames, entityColors: colorMap, streakRecord }
    }, [data])

    const currentFrame = frames[currentFrameIdx]

    const activeLabels = useMemo(
        () => new Set(currentFrame?.top10.map((e) => e.label) ?? []),
        [currentFrame]
    )

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

    const hasInitializedEntity = useRef(false)
    useEffect(() => {
        if (!hasInitializedEntity.current) {
            hasInitializedEntity.current = true
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

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-1 border-b md:border-b-0 md:border-r border-gray-200 dark:border-slate-700/50 pb-4 md:pb-0 md:pr-6 flex flex-col gap-4">
                    <GhostLeaderboard
                        ranking={currentFrame.ghostRanking}
                        activeLabels={activeLabels}
                    />
                    {streakRecord.weeks > 0 && (
                        <InsightCard>
                            <div className="text-xs text-gray-400 dark:text-gray-500 mb-0.5">
                                🔥 Longest streak
                            </div>
                            {currentFrameIdx >= frames.length - 1 ? (
                                <div>
                                    <span className="font-bold">
                                        {streakRecord.label}
                                    </span>
                                    <span className="text-xs font-normal text-gray-500 dark:text-gray-400 ml-1">
                                        {streakRecord.weeks} consecutive weeks
                                    </span>
                                </div>
                            ) : (
                                <div className="text-xs text-gray-400 dark:text-gray-500 italic">
                                    Watch till the end to find out…
                                </div>
                            )}
                        </InsightCard>
                    )}
                </div>

                <div className="md:col-span-2 flex flex-col">
                    <div
                        className="flex justify-end"
                        style={{ paddingRight: SCORE_COL_WIDTH }}
                    >
                        <span className="text-xs text-gray-400 dark:text-gray-500 font-mono">
                            score
                        </span>
                    </div>

                    <div
                        className="relative w-full mt-4"
                        style={{
                            height: currentFrame.top10.length * BAR_STRIDE,
                        }}
                    >
                        {currentFrame.top10.map((item, index) => {
                            const widthPercent =
                                (item.score / currentFrame.maxScore) * 100
                            const topPos = index * BAR_STRIDE

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
                                    <div
                                        className="ml-2 text-sm font-mono text-right text-gray-600 dark:text-gray-300 transition-all duration-300 ease-linear"
                                        style={{ minWidth: SCORE_COL_WIDTH }}
                                    >
                                        {Math.round(
                                            item.score
                                        ).toLocaleString()}
                                    </div>
                                </div>
                            )
                        })}
                    </div>

                    <p className="text-[10px] text-gray-400 dark:text-gray-600 text-center mt-2">
                        Score = Σ streams × e^(−λ×Δweeks) · λ = 0.2
                    </p>
                </div>
            </div>

            {frames.length > 1 && (
                <RaceControlBar
                    frameCount={frames.length}
                    startTs={frames[0].periodTs}
                    endTs={frames[frames.length - 1].periodTs}
                    currentFrameIdx={currentFrameIdx}
                    speedMultiplier={speedMultiplier}
                    isPlaying={isPlaying}
                    onFrameChange={(idx) => {
                        setIsPlaying(false)
                        setCurrentFrameIdx(idx)
                    }}
                    onSpeedChange={setSpeedMultiplier}
                    onPlayPause={() => {
                        if (currentFrameIdx >= frames.length - 1) {
                            setCurrentFrameIdx(0)
                            setIsPlaying(true)
                        } else {
                            setIsPlaying((prev) => !prev)
                        }
                    }}
                />
            )}
        </div>
    )
}
