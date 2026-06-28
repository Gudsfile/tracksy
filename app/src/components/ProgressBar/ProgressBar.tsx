type ProgressBarProps = {
    stage: string
    percent: number
}

export function ProgressBar({ stage, percent }: ProgressBarProps) {
    return (
        <div className="w-full max-w-sm mx-auto flex flex-col gap-2">
            <p className="text-sm text-center text-gray-500 dark:text-slate-400">
                {stage}
            </p>
            <div className="h-2 rounded-full bg-gray-200 dark:bg-slate-700 overflow-hidden">
                <div
                    className="h-full rounded-full bg-gradient-brand transition-all duration-300 ease-out"
                    style={{ width: `${percent}%` }}
                />
            </div>
        </div>
    )
}
