import { useDBQueryFirst } from '../../../../hooks/useDBQuery'
import { queryListeningRhythm, type ListeningRhythmResult } from './query'
import { ListeningRhythm as ListeningRhythmView } from './ListeningRhythm'

export function ListeningRhythm({ year }: { year: number | undefined }) {
    const { data, isLoading } = useDBQueryFirst<ListeningRhythmResult>({
        query: queryListeningRhythm(year),
        year,
    })

    return <ListeningRhythmView data={data} isLoading={isLoading} />
}
