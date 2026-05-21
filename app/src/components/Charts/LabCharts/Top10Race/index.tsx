import { useEffect, useState } from 'react'
import { queryDBAsJSON } from '../../../../db/queries/queryDB'
import { queryTop10Evolution, type Top10EvolutionQueryResult } from './query'
import { Top10EvolutionView } from './Top10EvolutionView'
import { ChartCard } from '../../SimpleCharts/shared'

export function Top10Evolution({ year }: { year: number | undefined }) {
    const [data, setData] = useState<Top10EvolutionQueryResult[]>([])
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true)
            try {
                const result = await queryDBAsJSON<Top10EvolutionQueryResult>(
                    queryTop10Evolution(year)
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
            title="Top 10 Evolution"
            emoji="🏎️"
            className="mt-4 md:col-span-2 lg:col-span-3"
            isLoading={isLoading}
        >
            {data.length > 0 && <Top10EvolutionView data={data} />}
        </ChartCard>
    )
}
