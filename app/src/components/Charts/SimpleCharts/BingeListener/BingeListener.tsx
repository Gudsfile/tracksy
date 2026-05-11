import type { FC } from 'react'
import type { BingeListenerResult } from './query'
import { ChartCard, ChartCardEmpty, ChartHero, InsightCard } from '../shared'

type Props = {
    data: BingeListenerResult | undefined
    isLoading?: boolean
}

function formatDate(dateStr: string): string {
    return new Date(dateStr + 'T00:00:00').toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
    })
}

export const BingeListener: FC<Props> = ({ data, isLoading }) => {
    return (
        <ChartCard
            title="Deep Dive"
            emoji="🎧"
            isLoading={isLoading}
            question="What's my most immersive day this year?"
        >
            {!data?.hours_played ? (
                <ChartCardEmpty />
            ) : (
                <>
                    <ChartHero
                        label={data.hours_played.toFixed(1)}
                        sublabel="hours in a day"
                    />
                    <InsightCard>{formatDate(data.date)}</InsightCard>
                </>
            )}
        </ChartCard>
    )
}
