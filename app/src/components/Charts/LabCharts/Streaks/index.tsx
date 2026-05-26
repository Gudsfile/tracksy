import { useDBQueryMany } from '../../../../hooks/useDBQuery'
import { queryStreaks, type StreaksQueryResult } from './query'
import { StreaksView } from './StreaksView'

interface StreaksProps {
    year: number | undefined
    isLatestYear: boolean
}

export function Streaks({ year, isLatestYear }: StreaksProps) {
    const { data, isLoading } = useDBQueryMany<StreaksQueryResult>({
        query: queryStreaks(year),
        year,
    })
    return (
        <StreaksView
            data={data}
            year={year}
            isLatestYear={isLatestYear}
            isLoading={isLoading}
        />
    )
}
