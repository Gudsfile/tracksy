import type { FC } from 'react'
import type { NewVsOldResult } from './query'
import { ChartCard, ChartCardEmpty, ChartHero, InsightCard } from '../shared'

type Props = {
    data: NewVsOldResult | undefined
    isLoading?: boolean
}

export const NewVsOld: FC<Props> = ({ data, isLoading }) => {
    const newPct = data?.total
        ? (data.new_artists_streams / data.total) * 100
        : 0
    const oldPct = data?.total
        ? (data.old_artists_streams / data.total) * 100
        : 0

    const top =
        oldPct > newPct
            ? 'Comfort Listener'
            : oldPct < newPct
              ? 'Trend Hunter'
              : 'Balanced Tast'

    return (
        <ChartCard
            title="Fresh vs Familiar"
            emoji="🆕"
            isLoading={isLoading}
            question="Am I discovering new artists?"
        >
            {!data ? (
                <ChartCardEmpty />
            ) : (
                <>
                    <ChartHero label={top} />

                    <div className="flex items-center gap-4 mb-4 text-xs text-gray-600 dark:text-gray-400">
                        <div
                            role="list"
                            className="flex-1 text-center contents"
                        >
                            <div role="listitem" className="flex-1 text-center">
                                <div className="text-2xl font-bold text-brand-purple">
                                    {newPct.toFixed(0)}%
                                </div>
                                <div>Discoveries</div>
                            </div>
                            <div className="text-2xl" role="separator">
                                |
                            </div>
                            <div role="listitem" className="flex-1 text-center">
                                <div className="text-2xl font-bold text-brand-blue">
                                    {oldPct.toFixed(0)}%
                                </div>
                                <div>Favorites</div>
                            </div>
                        </div>
                    </div>

                    <div className="w-full bg-gray-200 dark:bg-slate-700/50 rounded-full h-3 mb-3 overflow-hidden flex">
                        <div
                            className="bg-brand-purple h-full"
                            style={{ width: `${newPct}%` }}
                        ></div>
                        <div
                            className="bg-brand-blue h-full"
                            style={{ width: `${oldPct}%` }}
                        ></div>
                    </div>

                    <InsightCard>
                        {data.new_artists_count.toLocaleString()} new artists
                        discovered this year!
                    </InsightCard>
                </>
            )}
        </ChartCard>
    )
}
