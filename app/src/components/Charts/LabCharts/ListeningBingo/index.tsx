import { useDBQueryMany } from '../../../../hooks/useDBQuery'
import {
    type ListeningBingoQueryResult,
    listeningBingoQueryByYear,
} from './query'
import { ListeningBingoView } from './ListeningBingoView'

interface ListeningBingoProps {
    year: number | undefined
}

export function ListeningBingo({ year }: ListeningBingoProps) {
    const { data, isLoading } = useDBQueryMany<ListeningBingoQueryResult>({
        query: listeningBingoQueryByYear(year),
        year,
    })

    return <ListeningBingoView data={data} year={year} isLoading={isLoading} />
}
