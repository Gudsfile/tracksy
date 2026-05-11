import { useDBQueryFirst } from '../../../../hooks/useDBQuery'
import {
    buildUnbeatableStreakQuery,
    type UnbeatableStreakResult,
} from './query'
import { UnbeatableStreak as UnbeatableStreakView } from './UnbeatableStreak'

export function UnbeatableStreak() {
    const { data, isLoading } = useDBQueryFirst<UnbeatableStreakResult>({
        query: buildUnbeatableStreakQuery(),
    })
    return <UnbeatableStreakView data={data} isLoading={isLoading} />
}
