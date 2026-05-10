import { useDBQueryFirst } from '../../../../hooks/useDBQuery'
import { querySessionAnalysis, type SessionAnalysisResult } from './query'
import { SessionAnalysis as SessionAnalysisView } from './SessionAnalysis'

export function SessionAnalysis({ year }: { year: number | undefined }) {
    const { data, isLoading } = useDBQueryFirst<SessionAnalysisResult>({
        query: querySessionAnalysis(year),
        year,
    })

    return <SessionAnalysisView data={data} isLoading={isLoading} />
}
