import { useEffect, useState } from 'react'
import { queryDBAsJSON } from '../../../../db/queries/queryDB'
import { queryArtistDiscovery, type ArtistDiscoveryQueryResult } from './query'
import { ArtistDiscoveryPlot } from './plot'

export function ArtistDiscovery() {
    const [data, setData] = useState<ArtistDiscoveryQueryResult[]>([])

    useEffect(() => {
        const fetchData = async () => {
            const result = await queryDBAsJSON<ArtistDiscoveryQueryResult>(
                queryArtistDiscovery()
            )
            setData(result)
        }
        fetchData()
    }, [])

    if (data.length === 0) return null

    return (
        <div className="group p-6 my-4 bg-white dark:bg-slate-900/80 backdrop-blur-md rounded-2xl border border-gray-300/60 dark:border-slate-700/50 text-gray-900 dark:text-gray-100 transition-all duration-300 hover:shadow-glass-lg hover:scale-[1.01] animate-fade-in">
            <ArtistDiscoveryPlot data={data} />
        </div>
    )
}
