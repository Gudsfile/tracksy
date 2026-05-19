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

function formatHours(hours: number): string {
    const h = Math.floor(hours)
    const m = Math.round((hours - h) * 60)
    if (m === 0) return `${h}h`
    return `${h}h ${m}min`
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
                        label={formatHours(data.hours_played)}
                        sublabel="in a day"
                    />
                    <InsightCard>{formatDate(data.stream_date)}</InsightCard>
                </>
            )}
        </ChartCard>
    )
}
