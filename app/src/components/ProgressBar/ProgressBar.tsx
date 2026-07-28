type ProgressBarProps = {
    stage: string
    percent: number
    /**
     * Set false when the caller already shows `stage` itself — the bar keeps it
     * as its accessible name instead of repeating it on screen.
     */
    showLabel?: boolean
}

export function ProgressBar({
    stage,
    percent,
    showLabel = true,
}: ProgressBarProps) {
    return (
        <div className="w-full max-w-sm mx-auto flex flex-col gap-2">
            {showLabel && (
                <p className="text-sm text-center text-gray-500 dark:text-slate-400">
                    {stage}
                </p>
            )}
            <div
                role="progressbar"
                aria-label={stage}
                aria-valuenow={percent}
                aria-valuemin={0}
                aria-valuemax={100}
                className="h-2 rounded-full bg-gray-200 dark:bg-slate-700 overflow-hidden"
            >
                <div
                    className="h-full rounded-full bg-gradient-brand transition-all duration-300 ease-out"
                    style={{ width: `${percent}%` }}
                />
            </div>
        </div>
    )
}
