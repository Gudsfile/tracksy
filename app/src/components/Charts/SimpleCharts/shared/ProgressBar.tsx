import type { FC } from 'react'

type Props = {
    pct: number
    color?: string
    height?: string
}

export const ProgressBar: FC<Props> = ({ pct, color, height = 'h-2' }) => {
    const clampedPct = Math.min(Math.max(pct, 0), 100)
    return (
        <div
            className={`w-full bg-gray-200 dark:bg-slate-700/50 rounded-full overflow-hidden mb-1.5`}
        >
            <div
                className={`${color} ${height} rounded-full`}
                style={{ width: `${clampedPct}%` }}
            />
        </div>
    )
}
