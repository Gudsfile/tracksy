import { useEffect, useState } from 'react'
import { queryDBAsJSON } from '../../../../db/queries/queryDB'
import { queryTop10Race, type Top10RaceQueryResult } from './query'
import { Top10RaceView } from './Top10RaceView'
import { ChartCard, ChartCardEmpty } from '../../SimpleCharts/shared'

export function Top10Race({ year }: { year: number | undefined }) {
    const [data, setData] = useState<Top10RaceQueryResult[]>([])
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true)
            try {
                const result = await queryDBAsJSON<Top10RaceQueryResult>(
                    queryTop10Race(year)
                )
                setData(result || [])
            } finally {
                setIsLoading(false)
            }
        }
        fetchData()
    }, [year])

    return (
        <ChartCard
            title="Top 10 Race"
            emoji="🏎️"
            className="mt-4 md:col-span-2 lg:col-span-3"
            isLoading={isLoading}
            question="Who dominated my listening, and when did they rise?"
        >
            {data.length === 0 ? (
                <ChartCardEmpty />
            ) : (
                <Top10RaceView data={data} />
            )}
        </ChartCard>
    )
}
