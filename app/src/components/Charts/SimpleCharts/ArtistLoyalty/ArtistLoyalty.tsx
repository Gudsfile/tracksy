import type { FC } from 'react'
import type { ArtistLoyaltyResult } from './query'
import { ChartCard, ChartHero } from '../shared'
import { classifyArtistLoyalty } from './classifyArtistLoyalty'

type Props = {
    data: ArtistLoyaltyResult[]
}

export const ArtistLoyalty: FC<Props> = ({ data }) => {
    const totalArtists = data.reduce((sum, bin) => sum + bin.artist_count, 0)

    const classification = classifyArtistLoyalty(data)

    const bins = [
        {
            label: '1 stream',
            value: data[0]?.share_of_total_streams * 100 || 0,
            color: 'bg-teal-400',
            textColor: 'text-teal-700 dark:text-teal-400',
        },
        {
            label: '2-10 streams',
            value: data[1]?.share_of_total_streams * 100 || 0,
            color: 'bg-orange-400',
            textColor: 'text-orange-700 dark:text-orange-400',
        },
        {
            label: '11-100 streams',
            value: data[2]?.share_of_total_streams * 100 || 0,
            color: 'bg-violet-400',
            textColor: 'text-violet-700 dark:text-violet-400',
        },
        {
            label: '101-1000 streams',
            value: data[3]?.share_of_total_streams * 100 || 0,
            color: 'bg-blue-400',
            textColor: 'text-blue-700 dark:text-blue-400',
        },
        {
            label: '1000+ streams',
            value: data[4]?.share_of_total_streams * 100 || 0,
            color: 'bg-rose-500',
            textColor: 'text-rose-700 dark:text-rose-400',
        },
    ]

    return (
        <ChartCard title="Artist Loyalty" emoji="🤝">
            <ChartHero
                label={classification.label}
                sublabel={`${totalArtists.toLocaleString()} artists`}
                emoji={classification.emoji}
            />

            <div className="space-y-2">
                {bins.map((bin) => {
                    return (
                        <div
                            key={bin.label}
                            className="flex items-center gap-3"
                        >
                            <div
                                className={`w-3 h-3 rounded-full ${bin.color} flex-shrink-0`}
                            />
                            <div className="flex-1 min-w-0">
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-gray-600 dark:text-gray-400">
                                        {bin.label}
                                    </span>
                                </div>
                                <div className="w-full bg-gray-100 dark:bg-slate-800 rounded-full h-1.5 mt-1 overflow-hidden">
                                    <div
                                        className={`${bin.color} h-1.5 rounded-full`}
                                        style={{ width: `${bin.value}%` }}
                                    />
                                </div>
                            </div>
                            <div
                                className={`text-sm font-medium ${bin.textColor} w-14 text-right`}
                            >
                                {bin.value.toFixed(0)}%
                            </div>
                        </div>
                    )
                })}
            </div>
        </ChartCard>
    )
}
