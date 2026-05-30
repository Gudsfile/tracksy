import { useDBQueryMany } from '../../../../hooks/useDBQuery'
import {
    queryListeningStreaks,
    type ListeningStreaksQueryResult,
} from './query'
import { ListeningStreaksView } from './ListeningStreaksView'

interface ListeningStreaksProps {
    year: number | undefined
    isLatestYear: boolean
}

export function ListeningStreaks({
    year,
    isLatestYear,
}: ListeningStreaksProps) {
    const { data, isLoading } = useDBQueryMany<ListeningStreaksQueryResult>({
        query: queryListeningStreaks(year),
        year,
    })
    return (
        <ListeningStreaksView
            data={data}
            year={year}
            isLatestYear={isLatestYear}
            isLoading={isLoading}
        />
    )
}
