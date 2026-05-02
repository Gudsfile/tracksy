import { useDBQueryFirst } from '../../../../hooks/useDBQuery'
import { queryRegularity, type RegularityResult } from './query'
import { Regularity as RegularityView } from './Regularity'

export function Regularity({ year }: { year: number | undefined }) {
    const { sql, params } = queryRegularity(year)
    const { data } = useDBQueryFirst<RegularityResult>({
        query: sql,
        params,
        year,
    })

    if (!data) return null
    return <RegularityView data={data} />
}
