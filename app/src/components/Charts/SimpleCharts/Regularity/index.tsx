import { useDBQueryFirst } from '../../../../hooks/useDBQuery'
import { queryRegularity, type RegularityResult } from './query'
import { Regularity as RegularityView } from './Regularity'

export function Regularity({ year }: { year: number | undefined }) {
    const { data } = useDBQueryFirst<RegularityResult>({
        query: queryRegularity(year),
        year,
    })

    if (!data) return null
    return <RegularityView data={data} />
}
