import { type QueryResult, queryTopStreak, queryCurrentStreak } from './query'
import { TopStreak as TopStreakComponent } from './TopStreak'
import { queryDBAsJSON } from '../../../db/queries/queryDB'
import { useState, useEffect } from 'react'

export function TopStreak() {
    const [topStreak, setTopStreak] = useState<QueryResult[] | undefined>()
    const [currentStreak, setCurrentStreak] = useState<
        QueryResult[] | undefined
    >()
    const [isHovering, setIsHovering] = useState(false)

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

    const handleMouseEnter = () => setIsHovering(true)
    const handleMouseLeave = () => setIsHovering(false)

    const dataToShow = isHovering ? currentStreak : topStreak

    if (!dataToShow) {
        return <></>
    }

    if (dataToShow.length === 0) {
        return <></>
    }

    return (
        <div
            className="p-4 my-4 border rounded-lg shadow-sm bg-white dark:bg-gray-900 dark:border-gray-700 text-gray-900 dark:text-gray-100"
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            style={{ cursor: 'pointer' }}
        >
            <TopStreakComponent data={dataToShow} />
        </div>
    )
}
