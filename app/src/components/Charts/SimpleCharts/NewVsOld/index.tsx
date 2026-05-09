import { useDBQueryFirst } from '../../../../hooks/useDBQuery'
import { queryNewVsOld, type NewVsOldResult } from './query'
import { NewVsOld as NewVsOldView } from './NewVsOld'

export function NewVsOld({ year }: { year: number | undefined }) {
    const { data, isLoading } = useDBQueryFirst<NewVsOldResult>({
        query: queryNewVsOld(year),
        year,
    })

    if (!isLoading && !data) return null
    return <NewVsOldView data={data} isLoading={isLoading} />
}
