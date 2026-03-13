import { useDBQueryFirst } from '../../../../hooks/useDBQuery'
import { queryNewVsOld, type NewVsOldResult } from './query'
import { NewVsOld as NewVsOldView } from './NewVsOld'

export function NewVsOld({ year }: { year: number }) {
    const { data } = useDBQueryFirst<NewVsOldResult>({
        query: queryNewVsOld(year),
        year,
    })

    if (!data) return null
    return <NewVsOldView data={data} />
}
