import { useDBQueryFirst } from '../../../../hooks/useDBQuery'
import {
    buildUnbeatableStreakQuery,
    type UnbeatableStreakResult,
} from './query'
import { UnbeatableStreak as UnbeatableStreakView } from './UnbeatableStreak'

export function UnbeatableStreak({ year }: { year: number | undefined }) {
    const { data, isLoading } = useDBQueryFirst<UnbeatableStreakResult>({
        query: buildUnbeatableStreakQuery(year),
        year,
    })
    return <UnbeatableStreakView data={data} isLoading={isLoading} />
}
