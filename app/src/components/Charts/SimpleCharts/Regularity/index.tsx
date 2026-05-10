import { useDBQueryFirst } from '../../../../hooks/useDBQuery'
import { queryRegularity, type RegularityResult } from './query'
import { Regularity as RegularityView } from './Regularity'

export function Regularity({ year }: { year: number | undefined }) {
    const { data, isLoading } = useDBQueryFirst<RegularityResult>({
        query: queryRegularity(year),
        year,
    })

    return <RegularityView data={data} isLoading={isLoading} />
}
