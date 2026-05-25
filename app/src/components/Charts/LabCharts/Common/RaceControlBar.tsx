export type RaceControlBarProps = {
    frameCount: number
    startTs: number
    endTs: number
    currentFrameIdx: number
    speedMultiplier: number
    isPlaying: boolean
    onFrameChange: (idx: number) => void
    onSpeedChange: (speed: number) => void
    onPlayPause: () => void
}

export function RaceControlBar({
    frameCount,
    startTs,
    endTs,
    currentFrameIdx,
    speedMultiplier,
    isPlaying,
    onFrameChange,
    onSpeedChange,
    onPlayPause,
}: RaceControlBarProps) {
    const atEnd = currentFrameIdx >= frameCount - 1

    return (
        <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 w-full bg-gray-100 dark:bg-slate-800/80 rounded-lg p-1 border border-gray-300/30">
            <div className="flex items-center gap-2 flex-1 min-w-0 px-1">
                <span className="text-xs text-gray-500 dark:text-gray-400 font-mono select-none shrink-0">
                    {new Date(startTs).toLocaleDateString(undefined, {
                        year: 'numeric',
                        month: 'short',
                    })}
                </span>
                <input
                    type="range"
                    aria-label="Animation timeline"
                    min={0}
                    max={frameCount - 1}
                    value={currentFrameIdx}
                    onChange={(e) => onFrameChange(Number(e.target.value))}
                    className="flex-1 h-1.5 bg-gray-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-500 min-w-0"
                />
                <span className="text-xs text-gray-500 dark:text-gray-400 font-mono select-none shrink-0">
                    {new Date(endTs).toLocaleDateString(undefined, {
                        year: 'numeric',
                        month: 'short',
                    })}
                </span>
            </div>

            <div className="flex items-center shrink-0 self-center sm:self-auto">
                {([0.5, 1, 2, 4] as const).map((speed) => (
                    <button
                        key={speed}
                        type="button"
                        onClick={() => onSpeedChange(speed)}
                        className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-all ${
                            speedMultiplier === speed
                                ? 'bg-blue-500 text-white shadow-sm'
                                : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
                        }`}
                    >
                        {speed}x
                    </button>
                ))}
                <div className="w-px h-4 bg-gray-300/50 dark:bg-slate-600/50 mx-1" />
                <button
                    type="button"
                    onClick={onPlayPause}
                    aria-label={isPlaying ? 'Pause' : atEnd ? 'Replay' : 'Play'}
                    title={isPlaying ? 'Pause' : atEnd ? 'Replay' : 'Play'}
                    className="p-1.5 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white rounded-md transition-all"
                >
                    {isPlaying ? (
                        <svg
                            width="16"
                            height="16"
                            viewBox="0 0 16 16"
                            fill="currentColor"
                        >
                            <rect x="3" y="2" width="4" height="12" rx="1" />
                            <rect x="9" y="2" width="4" height="12" rx="1" />
                        </svg>
                    ) : atEnd ? (
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
    )
}
