import type { FC } from 'react'
import type { PlatformResult } from './query'
import { ChartCard } from '../../../ChartCard/ChartCard'

type Props = {
    data: PlatformResult[]
}

export const PrincipalPlatform: FC<Props> = ({ data }) => {
    if (data.length === 0) return null

    const topPlatform = data[0]

    return (
        <ChartCard title="Your Sound Machine" emoji="📱">
            <div className="mb-4">
                <div className="text-2xl font-bold text-brand-purple">
                    {topPlatform.platform}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400 ">
                    {topPlatform.stream_count.toLocaleString()} streams
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
                                {platform.pct.toFixed(1)}%
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
        </ChartCard>
    )
}
