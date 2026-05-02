import { useDBQueryFirst } from '../../../../hooks/useDBQuery'
import { queryNewVsOld, type NewVsOldResult } from './query'
import { NewVsOld as NewVsOldView } from './NewVsOld'

export function NewVsOld({ year }: { year: number | undefined }) {
    const { sql, params } = queryNewVsOld(year)
    const { data } = useDBQueryFirst<NewVsOldResult>({
        query: sql,
        params,
        year,
    })

    if (!data) return null
    return <NewVsOldView data={data} />
}
