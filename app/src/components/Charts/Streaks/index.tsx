import { type StreaksQueryResult, queryStreaks } from './query'
import { Streaks as StreaksPlot } from './Streaks'
import { queryDBAsJSON } from '../../../db/queries/queryDB'
import { useState, useEffect } from 'react'

export function Streaks() {
    const [data, setData] = useState<StreaksQueryResult[] | undefined>()

    useEffect(() => {
        const fetchStreaks = async () => {
            const result =
                await queryDBAsJSON<StreaksQueryResult>(queryStreaks())
            setData(result)
        }
        fetchStreaks()
    }, [])

    if (!data) return <></>

    return (
        <div className="group p-6 my-4 bg-white dark:bg-slate-900/80 backdrop-blur-md rounded-2xl border border-gray-300/60 dark:border-slate-700/50 text-gray-900 dark:text-gray-100 transition-all duration-300 hover:shadow-glass-lg hover:scale-[1.01] animate-fade-in">
            <StreaksPlot data={data} />
        </div>
    )
}
