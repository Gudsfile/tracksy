import {
    type TopArtistQueryResult,
    queryTopArtistByCount,
    queryTopArtistByDuration,
} from './query'
import { TopArtist as TopArtistPlot } from './TopArtist'
import { queryDBAsJSON } from '../../../db/queries/queryDB'
import { useState, useEffect } from 'react'

export function TopArtist() {
    const [topArtistByCount, settopArtistByCount] = useState<
        TopArtistQueryResult[] | undefined
    >()
    const [topArtistByDuration, setTopArtistByDuration] = useState<
        TopArtistQueryResult[] | undefined
    >()
    const [showByDuration, setShowByDuration] = useState(false)

    useEffect(() => {
        const fetchTopArtist = async () => {
            const topByCount = await queryDBAsJSON<TopArtistQueryResult>(
                queryTopArtistByCount()
            )
            settopArtistByCount(topByCount)
            const topByDuration = await queryDBAsJSON<TopArtistQueryResult>(
                queryTopArtistByDuration()
            )
            setTopArtistByDuration(topByDuration)
        }
        fetchTopArtist()
    }, [])

    const toggleStreakView = () => setShowByDuration((prev) => !prev)

    const dataToShow = showByDuration ? topArtistByDuration : topArtistByCount

    if (!dataToShow) return <></>

    return (
        <div className="flex-1 min-w-0 w-full relative p-4 my-4 border rounded-lg shadow-sm bg-white dark:bg-gray-900 dark:border-gray-700 text-gray-900 dark:text-gray-100">
            <button
                onClick={toggleStreakView}
                className="absolute top-3 right-3 px-3 py-1 text-xs font-medium text-gray-500 bg-gray-100 dark:bg-gray-800 dark:text-gray-400 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                aria-label={
                    showByDuration ? 'Show by duration' : 'Show by count'
                }
            >
                {showByDuration ? 'Show by duration' : 'Show by count'}
            </button>
            <TopArtistPlot data={dataToShow} />
        </div>
    )
}
