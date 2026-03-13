import { useDBQueryFirst } from '../../../../hooks/useDBQuery'
import { queryListeningRhythm, type ListeningRhythmResult } from './query'
import { ListeningRhythm as ListeningRhythmView } from './ListeningRhythm'

export function ListeningRhythm({ year }: { year: number }) {
    const { data } = useDBQueryFirst<ListeningRhythmResult>({
        query: queryListeningRhythm(year),
        year,
    })

    if (!data) return null
    return <ListeningRhythmView data={data} />
}
