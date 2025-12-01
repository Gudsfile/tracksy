import { useEffect, useState } from 'react'
import { queryDBAsJSON } from '../../../../db/queries/queryDB'
import { queryListeningRhythm, ListeningRhythmResult } from './query'
import { ListeningRhythm as ListeningRhythmView } from './ListeningRhythm'

export function ListeningRhythm() {
    const [data, setData] = useState<ListeningRhythmResult | null>(null)

    useEffect(() => {
        const fetch = async () => {
            const sql = queryListeningRhythm()
            const result = await queryDBAsJSON<ListeningRhythmResult>(sql)
            if (result && result.length > 0) setData(result[0])
        }
        fetch()
    }, [])

    if (!data) return null
    return <ListeningRhythmView data={data} />
}
