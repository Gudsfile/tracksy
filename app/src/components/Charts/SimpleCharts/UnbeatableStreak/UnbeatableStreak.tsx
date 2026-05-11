import type { FC } from 'react'
import type { UnbeatableStreakResult } from './query'
import { ChartCard, ChartCardEmpty, ChartHero, InsightCard } from '../shared'

type Props = {
    data: UnbeatableStreakResult | undefined
    isLoading?: boolean
}

function formatDate(dateStr: string): string {
    return new Date(dateStr + 'T00:00:00').toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
    })
}

export const UnbeatableStreak: FC<Props> = ({ data, isLoading }) => {
    return (
        <ChartCard
            title="On a Roll"
            emoji="🔥"
            isLoading={isLoading}
            question="What's my longest listening run this year?"
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
