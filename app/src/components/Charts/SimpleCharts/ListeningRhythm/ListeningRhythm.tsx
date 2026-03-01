import type { FC } from 'react'
import type { ListeningRhythmResult } from './query'

type Props = {
    data: ListeningRhythmResult
}

export const ListeningRhythm: FC<Props> = ({ data }) => {
    const { morning, afternoon, evening, night, total } = data
    const percent = (count: number) => (total ? (count / total) * 100 : 0)

    const bar = (pct: number) => (
        <div className="w-full bg-gray-200 dark:bg-slate-700/50 rounded-full h-2 mb-1 overflow-hidden">
            <div
                className="bg-brand-purple h-2 rounded-full"
                style={{ width: `${Math.min(Math.max(pct, 0), 100)}%` }}
            ></div>
        </div>
    )

    const dominant = Math.max(morning, afternoon, evening, night)
    const emoji =
        morning == dominant
            ? '🥣'
            : afternoon == dominant
              ? '🧃'
              : evening == dominant
                ? '🫒'
                : '🫐'

    const label =
        morning == dominant
            ? 'Morning'
            : afternoon == dominant
              ? 'Afternoon'
              : evening == dominant
                ? 'Evening'
                : 'Night'

    return (
        <div className="group p-6 bg-white dark:bg-slate-900/80 backdrop-blur-md rounded-2xl border border-gray-300/60 dark:border-slate-700/50 text-gray-900 dark:text-gray-100 transition-all duration-300 hover:shadow-glass-lg hover:scale-[1.01] animate-fade-in">
            <h3
                className="text-lg font-semibold mb-3 flex items-center gap-2"
                title="When did your music hit hardest?"
            >
                ⏰ Daily Vibes
            </h3>

            <div className="flex items-center justify-between mb-4">
                <div>
                    <div className="text-2xl font-bold">{label}</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                        {dominant.toLocaleString()} streams
                    </div>
                </div>
                <div className="text-4xl">{emoji}</div>
            </div>
            <ul className="space-y-2" role="list">
                <li role="listitem">
                    <div className="flex justify-between text-xs font-medium mb-1.5">
                        <span>Morning (6‑11h)</span>
                        <span className="text-brand-purple">
                            {percent(morning).toFixed(1)}%
                        </span>
                    </div>
                    {bar(percent(morning))}
                </li>
                <li role="listitem">
                    <div className="flex justify-between text-xs font-medium mb-1.5">
                        <span>Afternoon (12‑17h)</span>
                        <span className="text-brand-purple">
                            {percent(afternoon).toFixed(1)}%
                        </span>
                    </div>
                    {bar(percent(afternoon))}
                </li>
                <li role="listitem">
                    <div className="flex justify-between text-xs font-medium mb-1.5">
                        <span>Evening (18‑21h)</span>
                        <span className="text-brand-purple">
                            {percent(evening).toFixed(1)}%
                        </span>
                    </div>
                    {bar(percent(evening))}
                </li>
                <li role="listitem">
                    <div className="flex justify-between text-xs font-medium mb-1.5">
                        <span>Night (22‑5h)</span>
                        <span className="text-brand-purple">
                            {percent(night).toFixed(1)}%
                        </span>
                    </div>
                    {bar(percent(night))}
                </li>
            </ul>
        </div>
    )
}
