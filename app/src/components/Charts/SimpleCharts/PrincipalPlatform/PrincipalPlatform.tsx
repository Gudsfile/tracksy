import type { FC } from 'react'
import type { PlatformResult } from './query'

type Props = {
    data: PlatformResult[]
}

export const PrincipalPlatform: FC<Props> = ({ data }) => {
    if (data.length === 0) return null

    const topPlatform = data[0]

    return (
        <div className="group p-6 bg-white dark:bg-slate-900/80 backdrop-blur-md rounded-2xl border border-gray-300/60 dark:border-slate-700/50 text-gray-900 dark:text-gray-100 transition-all duration-300 hover:shadow-glass-lg hover:scale-[1.01] animate-fade-in">
            <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                📱 Listening Devices
            </h3>

            <div className="mb-4">
                <div className="text-2xl font-bold text-brand-purple">
                    {topPlatform.platform}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400 ">
                    Main platform
                </div>
            </div>

            <ul className="space-y-3" role="list">
                {data.map((platform) => (
                    <li key={platform.platform} role="listitem">
                        <div className="flex justify-between text-xs mb-1">
                            <span className="font-medium">
                                {platform.platform}
                            </span>
                            <span className="text-gray-600 dark:text-gray-400">
                                {platform.stream_count.toLocaleString()} (
                                {platform.pct.toFixed(1)}%)
                            </span>
                        </div>
                        <div className="w-full bg-gray-200 dark:bg-slate-700/50 h-2 rounded-full">
                            <div
                                className="bg-brand-purple h-2 rounded-full"
                                style={{ width: `${platform.pct}%` }}
                            ></div>
                        </div>
                    </li>
                ))}
            </ul>
        </div>
    )
}
