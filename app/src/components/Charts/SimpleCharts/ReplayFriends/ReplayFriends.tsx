import type { FC } from 'react'
import type { ArtistReplayBin } from './query'

type Props = {
    data: ArtistReplayBin[]
}

const BIN_CONFIG: Record<
    string,
    { label: string; color: string; textColor: string }
> = {
    '1': {
        label: '1 stream',
        color: 'bg-emerald-400',
        textColor: 'text-emerald-600 dark:text-emerald-400',
    },
    '2-10': {
        label: '2-10 streams',
        color: 'bg-teal-400',
        textColor: 'text-teal-600 dark:text-teal-400',
    },
    '11-100': {
        label: '11-100 streams',
        color: 'bg-amber-400',
        textColor: 'text-amber-600 dark:text-amber-400',
    },
    '101-1000': {
        label: '101-1000 streams',
        color: 'bg-orange-400',
        textColor: 'text-orange-600 dark:text-orange-400',
    },
    '1000+': {
        label: '1000+ streams',
        color: 'bg-rose-500',
        textColor: 'text-rose-600 dark:text-rose-400',
    },
}

const BIN_ORDER = ['1', '2-10', '11-100', '101-1000', '1000+']

export const ReplayFriends: FC<Props> = ({ data }) => {
    console.log(data)
    const totalArtists = data.reduce((sum, bin) => sum + bin.artist_count, 0)

    const getClassification = () => {
        const getShare = (bin) =>
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
        <div className="group p-6 bg-white dark:bg-slate-900/80 backdrop-blur-md rounded-2xl border border-gray-300/60 dark:border-slate-700/50 text-gray-900 dark:text-gray-100 transition-all duration-300 hover:shadow-glass-lg hover:scale-[1.01] animate-fade-in">
            <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                🤝 Artist Loyalty
            </h3>

            <div className="flex items-center justify-between mb-4">
                <div>
                    <div className="text-2xl font-bold">
                        {classification.label}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                        {totalArtists.toLocaleString()} artists
                    </div>
                </div>
                <div className="text-4xl">{classification.emoji}</div>
            </div>

            <div className="w-full bg-gray-200 dark:bg-slate-700/50 rounded-full h-4 mb-4 overflow-hidden flex">
                {data.map((bin) => {
                    const config = BIN_CONFIG[bin.stream_bin]
                    if (!config) return null
                    return (
                        <div
                            key={bin.stream_bin}
                            className={`${config.color} h-full first:rounded-l-full last:rounded-r-full transition-all duration-500`}
                            style={{
                                width: `${bin.share_of_total_streams * 100}%`,
                            }}
                            title={`${bin.stream_bin}: ${(bin.share_of_total_streams * 100).toFixed(1)}%`}
                        />
                    )
                })}
            </div>

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
                                    <span className="font-medium">
                                        {bin.artist_count.toLocaleString()}{' '}
                                        artists
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
        </div>
    )
}
