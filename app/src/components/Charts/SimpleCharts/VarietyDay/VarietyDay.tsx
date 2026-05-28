import type { FC } from 'react'
import type { VarietyDayResult } from './query'
import { ChartCard } from '../shared/ChartCard'
import { ChartCardEmpty } from '../shared/ChartCardEmpty'
import { ChartHero } from '../shared/ChartHero'
import { InsightCard } from '../shared/InsightCard'

type Props = {
    data: VarietyDayResult | undefined
    isLoading?: boolean
    year?: number
}

function formatDate(dateStr: string): string {
    return new Date(dateStr + 'T00:00:00').toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
    })
}

export const VarietyDay: FC<Props> = ({ data, isLoading, year }) => {
    const question =
        year !== undefined
            ? `My most diverse listening day in ${year}?`
            : 'My most diverse listening day ever?'

    return (
        <ChartCard
            title="Eclectic Day"
            emoji="🎨"
            isLoading={isLoading}
            question={question}
        >
            {!data?.artist_count ? (
                <ChartCardEmpty />
            ) : (
                <>
                    <ChartHero
                        label={String(data.artist_count)}
                        sublabel="different artists"
                    />
                    <InsightCard>{formatDate(data.stream_date)}</InsightCard>
                </>
            )}
        </ChartCard>
    )
}
