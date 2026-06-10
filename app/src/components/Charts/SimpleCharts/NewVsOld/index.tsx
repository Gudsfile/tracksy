import { useDBQueryFirst } from '../../../../hooks/useDBQuery'
import {
    queryNewVsOld,
    queryTotalArtists,
    type NewVsOldResult,
    type TotalArtistsResult,
} from './query'
import { NewVsOld as NewVsOldView } from './NewVsOld'

function NewVsOldLoader({ year }: { year: number }) {
    const { data, isLoading } = useDBQueryFirst<NewVsOldResult>({
        query: queryNewVsOld(year),
        year,
    })
    return <NewVsOldView data={data} isLoading={isLoading} year={year} />
}

function NewVsOldAllTimeFallback() {
    const { data: totalArtistsData, isLoading } =
        useDBQueryFirst<TotalArtistsResult>({
            query: queryTotalArtists(),
        })
    return (
        <NewVsOldView
            data={undefined}
            isLoading={isLoading}
            year={undefined}
            totalArtists={totalArtistsData?.total_artists}
        />
    )
}

export function NewVsOld({ year }: { year: number | undefined }) {
    if (year === undefined) return <NewVsOldAllTimeFallback />
    return <NewVsOldLoader year={year} />
}
