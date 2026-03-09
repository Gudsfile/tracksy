import type { FC } from 'react'
import type { ArtistLoyaltyResult } from './query'
import { ChartCard, ChartHero } from '../shared'

type Props = {
    data: ArtistLoyaltyResult[]
}

const BIN_CONFIG: Record<
    string,
    { label: string; color: string; textColor: string }
> = {
    '1': {
        label: '1 stream',
        color: 'bg-teal-400',
        textColor: 'text-teal-700 dark:text-teal-400',
    },
    '2-10': {
        label: '2-10 streams',
        color: 'bg-orange-400',
        textColor: 'text-orange-700 dark:text-orange-400',
    },
    '11-100': {
        label: '11-100 streams',
        color: 'bg-violet-400',
        textColor: 'text-violet-700 dark:text-violet-400',
    },
    '101-1000': {
        label: '101-1000 streams',
        color: 'bg-blue-400',
        textColor: 'text-blue-700 dark:text-blue-400',
    },
    '1000+': {
        label: '1000+ streams',
        color: 'bg-rose-500',
        textColor: 'text-rose-700 dark:text-rose-400',
    },
}

const BIN_ORDER = ['1', '2-10', '11-100', '101-1000', '1000+']

export const ArtistLoyalty: FC<Props> = ({ data }) => {
    const totalArtists = data.reduce((sum, bin) => sum + bin.artist_count, 0)

    const getClassification = () => {
        const getShare = (bin: string) =>
            data.find((b) => b.stream_bin === bin)?.share_of_total_streams || 0

        const share1 = getShare('1')
        const share2to10 = getShare('2-10')
        const share11to100 = getShare('11-100')
        const share101to1000 = getShare('101-1000')
        const share1000plus = getShare('1000+')

        const lowEngagement = share1 + share2to10
        const midEngagement = share11to100
        const highEngagement = share101to1000 + share1000plus

        if (highEngagement > 0.6) {
            return { label: 'Ultra Loyal', emoji: '🔥' }
        }

        if (lowEngagement > 0.6) {
            return { label: 'Explorer', emoji: '🔍' }
        }

        if (highEngagement > lowEngagement) {
            return { label: 'Favorites Driven', emoji: '❤️' }
        }

        if (midEngagement > 0.4) {
            return { label: 'Balanced Regular', emoji: '⚖️' }
        }

        return { label: 'Curious', emoji: '🧐' }
    }

    const classification = getClassification()

    return (
        <ChartCard title="Artist Loyalty" emoji="🤝">
            <ChartHero
                label={classification.label}
                sublabel={`${totalArtists.toLocaleString()} artists`}
                emoji={classification.emoji}
            />

            <div className="space-y-2">
                {BIN_ORDER.map((binKey) => {
                    const bin = data.find((b) => b.stream_bin === binKey)
                    if (!bin) return null
                    const config = BIN_CONFIG[binKey]
                    if (!config) return null

                    return (
                        <div key={binKey} className="flex items-center gap-3">
                            <div
                                className={`w-3 h-3 rounded-full ${config.color} flex-shrink-0`}
                            />
                            <div className="flex-1 min-w-0">
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-gray-600 dark:text-gray-400">
                                        {config.label}
                                    </span>
                                </div>
                                <div className="w-full bg-gray-100 dark:bg-slate-800 rounded-full h-1.5 mt-1 overflow-hidden">
                                    <div
                                        className={`${config.color} h-1.5 rounded-full`}
                                        style={{
                                            width: `${bin.share_of_total_streams * 100}%`,
                                        }}
                                    />
                                </div>
                            </div>
                            <div
                                className={`text-sm font-medium ${config.textColor} w-14 text-right`}
                            >
                                {(bin.share_of_total_streams * 100).toFixed(0)}%
                            </div>
                        </div>
                    )
                })}
            </div>
        </ChartCard>
    )
}
