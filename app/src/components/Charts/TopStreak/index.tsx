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
        <div className="flex-1 min-w-0 w-full relative p-4 my-4 border rounded-lg shadow-sm bg-white dark:bg-gray-900 dark:border-gray-700 text-gray-900 dark:text-gray-100">
            <button
                onClick={toggleStreakView}
                className="absolute top-3 right-3 px-3 py-1 text-xs font-medium text-gray-500 bg-gray-100 dark:bg-gray-800 dark:text-gray-400 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                aria-label={
                    showCurrent ? 'Show top streak' : 'Show current streak'
                }
            >
                {showCurrent ? 'Show Top' : 'Show Current'}
            </button>
            <TopStreakPlot data={dataToShow} />
        </div>
    )
}
