import { type QueryResult, query } from './query'
import { TopArtist as TopArtistPlot } from './TopArtist'
import { queryDBAsJSON } from '../../../db/queries/queryDB'
import { useState, useEffect } from 'react'

export function TopArtist() {
    const [data, setData] = useState<QueryResult[] | undefined>()

    useEffect(() => {
        const getData = async () => {
            const result = await queryDBAsJSON<QueryResult>(query())
            setData(result)
        }
        getData()
    }, [query])

    if (!data) return <></>

    return (
        <div className="p-4 my-4 border rounded-lg shadow-sm bg-white dark:bg-gray-900 dark:border-gray-700 text-gray-900 dark:text-gray-100">
            <TopArtistPlot data={data} />
        </div>
    )
}
