import { useDBQueryFirst } from '../../../../hooks/useDBQuery'
import { queryListeningRhythm, type ListeningRhythmResult } from './query'
import { ListeningRhythm as ListeningRhythmView } from './ListeningRhythm'

export function ListeningRhythm({ year }: { year: number | undefined }) {
    const { sql, params } = queryListeningRhythm(year)
    const { data } = useDBQueryFirst<ListeningRhythmResult>({
        query: sql,
        params,
        year,
    })

    if (!data) return null
    return <ListeningRhythmView data={data} />
}
