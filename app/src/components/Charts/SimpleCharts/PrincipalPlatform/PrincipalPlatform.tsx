import type { FC } from 'react'
import type { PlatformResult } from './query'
import { ChartCard, ChartHero, LabeledProgressBar } from '../shared'

type Props = {
    data: PlatformResult[]
}

export const PrincipalPlatform: FC<Props> = ({ data }) => {
    if (data.length === 0) return null

    const topPlatform = data[0]

    return (
        <ChartCard title="Your Sound Machine" emoji="📱">
            <ChartHero
                label={topPlatform.platform}
                sublabel={`${topPlatform.stream_count.toLocaleString()} streams`}
                labelColor="text-brand-purple"
            />

            <ul className="space-y-3" role="list">
                {data.map((platform) => (
                    <li key={platform.platform} role="listitem">
                        <LabeledProgressBar
                            label={platform.platform}
                            value={`${platform.pct.toFixed(1)}%`}
                            valueColor="text-gray-600 dark:text-gray-400"
                            pct={platform.pct}
                            barColor="bg-brand-purple"
                        />
                    </li>
                ))}
            </ul>
        </ChartCard>
    )
}
