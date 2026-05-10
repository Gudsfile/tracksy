import { buildYearCondition } from '../../../../db/queries/buildYearCondition'
import sqlQuery from './SessionAnalysis.sql?raw'

export type SessionAnalysisResult = {
    session_count: number
    avg_duration_ms: number
    median_tracks: number
    longest_session_ms: number
    longest_session_track_count: number
    longest_session_date: string
    peak_start_hour: number
}

export function querySessionAnalysis(year: number | undefined): string {
    const yearCondition = buildYearCondition(year, 'year(session_start::date)')
    return sqlQuery.replaceAll('${year_condition}', yearCondition)
}
