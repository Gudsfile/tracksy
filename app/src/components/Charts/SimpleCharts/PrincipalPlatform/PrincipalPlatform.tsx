import type { FC } from 'react'
import type { PlatformResult } from './query'

type Props = {
    data: PlatformResult[]
}

export const PrincipalPlatform: FC<Props> = ({ data }) => {
    if (data.length === 0) return null

    const topPlatform = data[0]

    return (
        <div className="p-4 bg-white dark:bg-gray-900 rounded-xl shadow border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100">
            <h3 className="text-lg font-semibold mb-2 flex items-center">
                📱 Listening Devices
            </h3>

            <div className="mb-4">
                <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                    {topPlatform.platform}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                    Main platform
                </div>
            </div>

            <div className="space-y-3">
                {data.map((platform) => (
                    <div key={platform.platform}>
                        <div className="flex justify-between text-xs mb-1">
                            <span className="font-medium">
                                {platform.platform}
                            </span>
                            <span className="text-gray-500 dark:text-gray-400">
                                {platform.stream_count.toLocaleString()} (
                                {platform.pct.toFixed(1)}%)
                            </span>
                        </div>
                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                            <div
                                className="bg-purple-500 h-2 rounded-full transition-all duration-300"
                                style={{ width: `${platform.pct}%` }}
                            ></div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}
