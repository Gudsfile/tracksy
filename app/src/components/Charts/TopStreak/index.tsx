import { type QueryResult, queryTopStreak, queryCurrentStreak } from './query'
import { TopStreak as TopStreakPlot } from './TopStreak'
import { queryDBAsJSON } from '../../../db/queries/queryDB'
import { useState, useEffect } from 'react'

export function TopStreak() {
    const [topStreak, setTopStreak] = useState<QueryResult[] | undefined>()
    const [currentStreak, setCurrentStreak] = useState<
        QueryResult[] | undefined
    >()
    const [showCurrent, setShowCurrent] = useState(false)

    useEffect(() => {
        const fetchStreaks = async () => {
            const top = await queryDBAsJSON<QueryResult>(queryTopStreak())
            setTopStreak(top)
            const current =
                await queryDBAsJSON<QueryResult>(queryCurrentStreak())
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
        <div className="relative p-4 my-4 border rounded-lg shadow-sm bg-white dark:bg-gray-900 dark:border-gray-700 text-gray-900 dark:text-gray-100">
            <button
                onClick={toggleStreakView}
                className="absolute top-2 right-2 px-2 py-1 text-xs font-bold text-white bg-blue-500 rounded hover:bg-blue-700"
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
