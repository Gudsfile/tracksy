import type { FC } from 'react'
import type { PlatformResult } from './query'
import {
    ChartCard,
    ChartCardEmpty,
    ChartHero,
    LabeledProgressBar,
} from '../shared'

type Props = {
    data: PlatformResult[] | undefined
    isLoading?: boolean
}

export const PrincipalPlatform: FC<Props> = ({ data, isLoading }) => {
    return (
        <ChartCard
            title="Your Sound Machine"
            emoji="📱"
            isLoading={isLoading}
            question="Which platform do I use the most for listening?"
        >
            {!data?.length ? (
                <ChartCardEmpty />
            ) : data.length === 1 ? (
                <p className="text-sm text-gray-400 dark:text-gray-500 italic text-center py-6">
                    All streams are on {data[0].platform}
                </p>
            ) : (
                <>
                    <ChartHero
                        label={data[0].platform}
                        sublabel={`${data[0].stream_count.toLocaleString()} streams`}
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
                </>
            )}
        </ChartCard>
    )
}
