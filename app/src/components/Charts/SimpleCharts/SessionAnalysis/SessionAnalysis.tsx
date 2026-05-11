import type { FC } from 'react'
import type { SessionAnalysisResult } from './query'
import { ChartCard, ChartCardEmpty, ChartHero, InsightCard } from '../shared'
import { formatDuration } from '../../../../utils/formatDuration'

type Props = {
    data: SessionAnalysisResult | undefined
    isLoading?: boolean
}

type Profile = { label: string; emoji: string; color: string }

function classify(avgMs: number): Profile {
    if (avgMs < 1200000)
        return { label: 'Express', emoji: '🏃', color: 'text-green-400' }
    if (avgMs < 3600000)
        return { label: 'Balanced', emoji: '🎧', color: 'text-blue-400' }
    return { label: 'Marathon', emoji: '🏔️', color: 'text-purple-400' }
}

export const SessionAnalysis: FC<Props> = ({ data, isLoading }) => {
    const profile = data ? classify(data.avg_duration_ms) : null

    return (
        <ChartCard
            title="Listening sessions"
            emoji="🎵"
            isLoading={isLoading}
            question="How are my listening sessions structured?"
            className="h-full"
        >
            {!data?.session_count ? (
                <ChartCardEmpty />
            ) : (
                <>
                    <ChartHero
                        label={profile!.label}
                        sublabel={`${data.session_count.toLocaleString()} sessions`}
                        emoji={profile!.emoji}
                        labelColor={profile!.color}
                    />

                    <div className="space-y-3">
                        <div className="grid grid-cols-2 gap-2 text-sm">
                            <div className="text-center p-2 bg-gray-100 dark:bg-slate-700/50 rounded-lg">
                                <div className="font-semibold text-gray-800 dark:text-gray-200">
                                    {formatDuration(
                                        Math.round(data.avg_duration_ms)
                                    )}
                                </div>
                                <div className="text-xs text-gray-500 dark:text-gray-400">
                                    average duration
                                </div>
                            </div>
                            <div className="text-center p-2 bg-gray-100 dark:bg-slate-700/50 rounded-lg">
                                <div className="font-semibold text-gray-800 dark:text-gray-200">
                                    {Math.round(data.median_tracks)} tracks
                                </div>
                                <div className="text-xs text-gray-500 dark:text-gray-400">
                                    median per session
                                </div>
                            </div>
                        </div>

                        <InsightCard>
                            Longest:{' '}
                            {formatDuration(
                                Math.round(data.longest_session_ms)
                            )}{' '}
                            — {data.longest_session_track_count} tracks on{' '}
                            {new Date(
                                data.longest_session_date
                            ).toLocaleDateString()}
                        </InsightCard>

                        <InsightCard>
                            Favorite start time:{' '}
                            {String(data.peak_start_hour).padStart(2, '0')}h
                        </InsightCard>
                        <p className="text-[10px] text-gray-400 dark:text-gray-600 text-center">
                            A session = consecutive streams with gaps ≤ 15 min
                        </p>
                    </div>
                </>
            )}
        </ChartCard>
    )
}
