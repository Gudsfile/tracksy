import type { FC } from 'react'
import type { UnbeatableStreakResult } from './query'
import { ChartCard } from '../shared/ChartCard'
import { ChartCardEmpty } from '../shared/ChartCardEmpty'
import { ChartHero } from '../shared/ChartHero'
import { InsightCard } from '../shared/InsightCard'

type Props = {
    data: UnbeatableStreakResult | undefined
    isLoading?: boolean
    year?: number
}

function formatDate(dateStr: string): string {
    return new Date(dateStr + 'T00:00:00').toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
    })
}

export const UnbeatableStreak: FC<Props> = ({ data, isLoading, year }) => {
    const question =
        year !== undefined
            ? `What's my longest listening run in ${year}?`
            : "What's my longest listening run ever?"

    return (
        <ChartCard
            title="On a Roll"
            emoji="🔥"
            isLoading={isLoading}
            question={question}
        >
            {!data?.streak_days ? (
                <ChartCardEmpty />
            ) : (
                <>
                    <ChartHero
                        label={String(data.streak_days)}
                        sublabel="days in a row"
                    />
                    <InsightCard>
                        {formatDate(data.start_date)} –{' '}
                        {formatDate(data.end_date)}
                    </InsightCard>
                </>
            )}
        </ChartCard>
    )
}
