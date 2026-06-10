import type { FC } from 'react'
import type { NewVsOldResult } from './query'
import { ChartCard } from '../shared/ChartCard'
import { ChartCardEmpty } from '../shared/ChartCardEmpty'
import { ChartHero } from '../shared/ChartHero'
import { InsightCard } from '../shared/InsightCard'

type Props = {
    data: NewVsOldResult | undefined
    isLoading?: boolean
    year?: number
    totalArtists?: number
}

export const NewVsOld: FC<Props> = ({
    data,
    isLoading,
    year,
    totalArtists,
}) => {
    if (year === undefined) {
        return (
            <ChartCard
                title="Fresh vs Familiar"
                emoji="🆕"
                isLoading={isLoading}
                question="Do I listen more to new or familiar artists?"
            >
                <p className="text-sm text-gray-400 dark:text-gray-500 italic text-center py-6">
                    Select a year to see your Fresh vs Familiar split
                </p>
                {totalArtists !== undefined && (
                    <InsightCard>
                        {totalArtists.toLocaleString()} artists discovered all
                        time
                    </InsightCard>
                )}
            </ChartCard>
        )
    }

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
              : 'Balanced Taste'

    return (
        <ChartCard
            title="Fresh vs Familiar"
            emoji="🆕"
            isLoading={isLoading}
            question="Do I listen more to new or familiar artists?"
        >
            {!data?.total ? (
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
                                <div>Fresh</div>
                            </div>
                            <div className="text-2xl" role="separator">
                                |
                            </div>
                            <div role="listitem" className="flex-1 text-center">
                                <div className="text-2xl font-bold text-brand-blue">
                                    {oldPct.toFixed(0)}%
                                </div>
                                <div>Familiar</div>
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
