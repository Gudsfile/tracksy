import type { FC } from 'react'
import type { VarietyDayResult } from './query'
import { ChartCard, ChartCardEmpty, ChartHero, InsightCard } from '../shared'

type Props = {
    data: VarietyDayResult | undefined
    isLoading?: boolean
}

function formatDate(dateStr: string): string {
    return new Date(dateStr + 'T00:00:00').toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
    })
}

export const VarietyDay: FC<Props> = ({ data, isLoading }) => {
    return (
        <ChartCard
            title="Eclectic Day"
            emoji="🎨"
            isLoading={isLoading}
            question="My most diverse listening day this year?"
        >
            {!data?.artist_count ? (
                <ChartCardEmpty />
            ) : (
                <>
                    <ChartHero
                        label={String(data.artist_count)}
                        sublabel="different artists"
                    />
                    <InsightCard>{formatDate(data.date)}</InsightCard>
                </>
            )}
        </ChartCard>
    )
}
