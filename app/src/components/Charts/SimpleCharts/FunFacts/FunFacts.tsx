import type { FC } from 'react'
import type { FunFactResult } from './queries'

type Props = {
    fact: FunFactResult
    onRefresh: () => void
    isLoading: boolean
}

export const factConfig = (type: string) => {
    switch (type) {
        // Moments
        case 'morning_favorite':
            return { title: '🌅 Musical Breakfast', emoji: '🥐' }
        case 'afternoon_favorite':
            return { title: '☀️ Afternoon Boost', emoji: '⚡️' }
        case 'evening_favorite':
            return { title: '🌆 Calm Return', emoji: '🛋️' }
        case 'night_favorite':
            return { title: '🌙 Musical Insomnia', emoji: '💤' }
        case 'night_champion':
            return { title: '🌙 Night Champion', emoji: '🏅' }
        case 'weekend_favorite':
            return { title: '🎉 Weekend Vibes', emoji: '🕺' }

        // Habits
        case 'favorite_weekday':
            return { title: '📅 Favorite Day', emoji: '📅' }

        // Loyalty
        case 'absolute_loyalty':
            return { title: '❤️ Absolute Loyalty', emoji: '💍' }
        case 'subscribed_artist':
            return { title: '🎸 Monthly Subscription', emoji: '📬' }

        // Nostalgia
        case 'nostalgic_return':
            return { title: '🕰️ Nostalgic Return', emoji: '📼' }
        case 'forgotten_artist':
            return { title: '🕰️ Forgotten Artist', emoji: '💔' }

        // Records
        case 'binge_listener':
            return { title: '🎧 Binge Listener', emoji: '🎶' }
        case 'unbeatable_streak':
            return { title: '🔥 Unbeatable Streak', emoji: '🏆' }
        case 'variety_day':
            return { title: '🌈 Variety Day', emoji: '🎨' }
        case 'one_hit_wonder':
            return { title: '⭐ One-Hit Wonder', emoji: '🎵' }
        case 'marathon':
            return { title: '🏃 Marathon', emoji: '☄️' }

        // Discovery
        case 'recent_discovery':
            return { title: '🎵 Recent Discovery', emoji: '✨' }
        case 'current_obsession':
            return { title: '🔁 Current Obsession', emoji: '🎯' }

        // Misc
        case 'musical_anniversary':
            return { title: '🎉 Musical Anniversary', emoji: '🎂' }
        case 'first_artist':
            return { title: '🦖 The Very First', emoji: '1️⃣' }
        case 'track_proposition':
            return { title: '🔮 Listening Proposition', emoji: '🐙' }
        case 'cozy_album':
            return { title: '💿 Cozy Album', emoji: '☁️' }

        default:
            return { title: '🎲 Fun Fact', emoji: '🎲' }
    }
}

export const FunFacts: FC<Props> = ({ fact, onRefresh, isLoading }) => {
    const { fact_type, main_text, second_text, value, unit, context } = fact
    const { title, emoji } = factConfig(fact_type)

    const valueDisplayed =
        typeof value === 'number' ? value.toLocaleString() : value

    return (
        <div className="col-span-1 md:col-span-2 lg:col-span-3 p-6 bg-gradient-to-br from-purple-50 to-blue-50 dark:from-gray-900 dark:to-slate-900 rounded-2xl shadow border border-purple-100 dark:border-gray-700 relative overflow-hidden group transition-all duration-300 shadow-glass hover:shadow-glass-lg hover:scale-[1.01] animate-fade-in">
            <div className="absolute top-0 right-0 p-4 transition-opacity">
                <button
                    onClick={onRefresh}
                    disabled={isLoading}
                    className="p-2 rounded-full shadow hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                    title="New fact"
                >
                    <span
                        className={`block text-xl ${isLoading ? 'animate-spin' : ''}`}
                    >
                        🔄
                    </span>
                </button>
            </div>

            <div className="flex flex-col md:flex-row items-center gap-6">
                <div className="text-6xl md:text-8xl flex-shrink-0 animate-bounce-slow">
                    {emoji}
                </div>

                <div className="flex-1 text-center md:text-left">
                    <div className="text-sm font-bold text-purple-600 dark:text-purple-400 uppercase tracking-wider mb-2">
                        {title}
                    </div>

                    <div className="text-2xl md:text-4xl font-bold text-gray-900 dark:text-white mb-2 break-words text-balance">
                        {main_text}
                    </div>

                    <div className="text-lg text-gray-600 dark:text-gray-300">
                        {second_text}{' '}
                        {second_text && valueDisplayed ? '(' : undefined}
                        <span className="font-bold text-blue-600 dark:text-blue-400">
                            {valueDisplayed}
                            {unit === '%' ? unit : undefined}
                        </span>{' '}
                        {unit !== '%' ? unit : undefined}
                        {second_text && valueDisplayed ? ')' : undefined}
                    </div>

                    {context && (
                        <div className="text-sm text-gray-600 dark:text-gray-400 mt-1 italic">
                            {context}
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
