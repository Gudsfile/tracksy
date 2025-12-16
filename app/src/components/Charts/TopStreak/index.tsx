import {
    type TopStreakQueryResult,
    queryTopStreak,
    queryCurrentStreak,
} from './query'
import { TopStreak as TopStreakPlot } from './TopStreak'
import { queryDBAsJSON } from '../../../db/queries/queryDB'
import { useState, useEffect } from 'react'

export function TopStreak() {
    const [topStreak, setTopStreak] = useState<
        TopStreakQueryResult[] | undefined
    >()
    const [currentStreak, setCurrentStreak] = useState<
        TopStreakQueryResult[] | undefined
    >()
    const [showCurrent, setShowCurrent] = useState(false)

    useEffect(() => {
        const fetchStreaks = async () => {
            const top =
                await queryDBAsJSON<TopStreakQueryResult>(queryTopStreak())
            setTopStreak(top)
            const current =
                await queryDBAsJSON<TopStreakQueryResult>(queryCurrentStreak())
            setCurrentStreak(current)
        }
        fetchStreaks()
    }, [])

    const toggleStreakView = () => setShowCurrent((prev) => !prev)

    const dataToShow = showCurrent ? currentStreak : topStreak

    if (!dataToShow) {
        return <></>
    }

    if (dataToShow.length === 0) {
        return <></>
    }

    return (
        <div className="group flex-1 p-6 bg-white dark:bg-slate-900/80 backdrop-blur-md rounded-2xl border border-gray-300/60 dark:border-slate-700/50 text-gray-900 dark:text-gray-100 transition-all duration-300 shadow-glass hover:shadow-glass-lg hover:scale-[1.01] animate-fade-in">
            <button
                onClick={toggleStreakView}
                className="absolute top-2 right-2 px-3 py-1.5 text-xs font-medium text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-slate-800/80 backdrop-blur-sm rounded-full hover:bg-brand-purple/20 hover:text-brand-purple dark:hover:bg-brand-purple/20 dark:hover:text-brand-purple transition-all duration-300 border border-gray-300/50 dark:border-slate-700/50"
                aria-label={
                    showCurrent ? 'Show top streak' : 'Show current streak'
                }
            >
                {showCurrent ? '📅 Current' : '🏆 Top'}
            </button>
            <TopStreakPlot data={dataToShow} />
        </div>
    )
}
