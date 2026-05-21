import { useEffect, useState, useMemo, useRef } from 'react'
import type { Top10EvolutionQueryResult } from './query'

type Props = {
    data: Top10EvolutionQueryResult[]
}

type ArtistScore = {
    artist: string
    play_count: number
}

type Frame = {
    dateTs: number
    top10: ArtistScore[]
    maxScore: number
}

// Helper to assign consistent colors to artists
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

export function Top10EvolutionView({ data }: Props) {
    const [currentFrameIdx, setCurrentFrameIdx] = useState(0)
    const [isPlaying, setIsPlaying] = useState(true)
    const [speedMultiplier, setSpeedMultiplier] = useState(1) // 1x, 2x, 4x

    // Base speed in ms
    const BASE_SPEED = 120

    // Precompute all frames from the event stream
    const { frames, artistColors } = useMemo(() => {
        const uniqueDates = Array.from(
            new Set(data.map((d) => d.stream_date_ts))
        ).sort((a, b) => a - b)

        const currentScores = new Map<string, number>()
        const allFrames: Frame[] = []
        const colorMap = new Map<string, string>()
        let colorIdx = 0

        // Group data by date
        const dataByDate = new Map<number, typeof data>()
        for (const row of data) {
            if (!dataByDate.has(row.stream_date_ts)) {
                dataByDate.set(row.stream_date_ts, [])
            }
            dataByDate.get(row.stream_date_ts)!.push(row)
        }

        // Generate a frame for each unique date
        for (const dateTs of uniqueDates) {
            const dayEvents = dataByDate.get(dateTs) || []
            for (const event of dayEvents) {
                currentScores.set(event.artist, event.play_count)
                if (!colorMap.has(event.artist)) {
                    colorMap.set(event.artist, colors[colorIdx % colors.length])
                    colorIdx++
                }
            }

            // Get top 10
            const sortedArtists = Array.from(currentScores.entries())
                .sort((a, b) => b[1] - a[1])
                .slice(0, 10)

            allFrames.push({
                dateTs,
                top10: sortedArtists.map(([artist, play_count]) => ({
                    artist,
                    play_count,
                })),
                maxScore: Math.max(1, sortedArtists[0]?.[1] || 1),
            })
        }

        return { frames: allFrames, artistColors: colorMap }
    }, [data])

    const currentFrame = frames[currentFrameIdx]

    useEffect(() => {
        if (!isPlaying || frames.length === 0) return

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
    }, [isPlaying, frames.length, speedMultiplier])

    if (!currentFrame) return null

    return (
        <div className="flex flex-col gap-4 w-full">
            <div className="flex items-center justify-between">
                <h4 className="text-2xl font-bold font-mono tracking-tight text-gray-800 dark:text-gray-100">
                    {new Date(currentFrame.dateTs).toLocaleDateString(
                        undefined,
                        { year: 'numeric', month: 'long', day: 'numeric' }
                    )}
                </h4>
                <button
                    onClick={() => {
                        if (currentFrameIdx >= frames.length - 1) {
                            setCurrentFrameIdx(0)
                            setIsPlaying(true)
                        } else {
                            setIsPlaying(!isPlaying)
                        }
                    }}
                    className="px-4 py-2 bg-gray-200 dark:bg-slate-700 hover:bg-gray-300 dark:hover:bg-slate-600 rounded-lg text-sm font-medium transition-colors"
                >
                    {isPlaying
                        ? 'Pause'
                        : currentFrameIdx >= frames.length - 1
                          ? 'Replay'
                          : 'Play'}
                </button>
            </div>

            <div className="relative h-[450px] w-full mt-4">
                {currentFrame.top10.map((item, index) => {
                    const widthPercent =
                        (item.play_count / currentFrame.maxScore) * 100
                    // Position from top based on index
                    const topPos = index * 44 // 40px height + 4px gap

                    return (
                        <div
                            key={item.artist}
                            className="absolute left-0 flex items-center w-full transition-all duration-300 ease-linear"
                            style={{
                                top: `${topPos}px`,
                                zIndex: 10 - index, // Higher ranks stay on top during cross
                            }}
                        >
                            {/* Bar */}
                            <div className="w-full relative h-9">
                                <div
                                    className={`absolute top-0 left-0 h-full rounded-r-md transition-all duration-300 ease-linear ${artistColors.get(item.artist)}`}
                                    style={{
                                        width: `${widthPercent}%`,
                                        opacity: 0.8,
                                    }}
                                />
                                {/* Label inside or right after bar depending on width */}
                                <div
                                    className="absolute left-2 h-full flex items-center font-medium text-sm text-gray-900 dark:text-white drop-shadow-md whitespace-nowrap overflow-hidden text-ellipsis"
                                    style={{ width: 'calc(100% - 16px)' }}
                                >
                                    <span className="font-bold w-6 text-right mr-2 opacity-70">
                                        #{index + 1}
                                    </span>
                                    {item.artist}
                                </div>
                            </div>
                            <div className="ml-2 min-w-[60px] text-sm font-mono text-gray-600 dark:text-gray-300 transition-all duration-300 ease-linear">
                                {item.play_count.toLocaleString()}
                            </div>
                        </div>
                    )
                })}
            </div>
        </div>
    )
}
