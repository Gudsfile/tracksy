import type { FC } from 'react'
import type { SkipRateResult } from './query'
import { classifySkipRate } from './classifySkipRate'
import {
    ChartCard,
    ChartCardEmpty,
    ChartHero,
    ProgressBar,
    InsightCard,
} from '../shared'

type Props = {
    data: SkipRateResult | undefined
    isLoading?: boolean
}

export const SkipRate: FC<Props> = ({ data, isLoading }) => {
    const complete_listens = data?.complete_listens ?? 0
    const skipped_listens = data?.skipped_listens ?? 0
    const complete_pct = data
        ? (complete_listens / (complete_listens + skipped_listens)) * 100
        : 0
    const { classification, emoji, message } = classifySkipRate(complete_pct)

    return (
        <ChartCard
            title="Skip Mood"
            emoji="⏭️"
            isLoading={isLoading}
            question="Do I skip tracks often?"
        >
            {!data ? (
                <ChartCardEmpty />
            ) : (
                <>
                    <ChartHero
                        label={classification}
                        sublabel={`${complete_pct.toFixed(1)}% are full listens`}
                        emoji={emoji}
                    />

                    <ProgressBar pct={complete_pct} color="bg-green-500" />

                    <ul
                        className="flex justify-between text-xs text-gray-600 dark:text-gray-400 mb-3"
                        role="list"
                    >
                        <li role="listitem">
                            Skippped ({skipped_listens.toLocaleString()})
                        </li>
                        <li role="listitem">
                            Completed ({complete_listens.toLocaleString()})
                        </li>
                    </ul>

                    <InsightCard>{message}</InsightCard>
                </>
            )}
        </ChartCard>
    )
}
