import { Fragment } from 'react'
import type { StreamPerDayOfWeekQueryResult } from './query'
import { ChartCard, ChartCardEmpty } from '../../SimpleCharts/shared'

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

type Props = {
    data: StreamPerDayOfWeekQueryResult[] | undefined
    isLoading?: boolean
}

export function StreamPerDayOfWeekView({ data, isLoading }: Props) {
    const isEmpty = !data || data.length === 0

    return (
        <ChartCard
            title="Listening Bingo"
            emoji="🎰"
            question="Have you listened at every hour of every day?"
            isLoading={isLoading}
        >
            {isEmpty ? (
                <ChartCardEmpty />
            ) : (
                <div className="flex flex-col gap-1 p-4">
                    <div className="grid grid-cols-[auto_repeat(24,1fr)] gap-px text-xs">
                        <div />
                        {Array.from({ length: 24 }, (_, h) => (
                            <div
                                key={h}
                                className="text-center text-muted-foreground"
                            >
                                {h}
                            </div>
                        ))}
                        {DAYS.map((day, d) => (
                            <Fragment key={d}>
                                <div className="pr-1 text-right text-muted-foreground">
                                    {day}
                                </div>
                                {Array.from({ length: 24 }, (_, h) => (
                                    <div
                                        key={h}
                                        className="aspect-square rounded-sm bg-muted"
                                    />
                                ))}
                            </Fragment>
                        ))}
                    </div>
                </div>
            )}
        </ChartCard>
    )
}
