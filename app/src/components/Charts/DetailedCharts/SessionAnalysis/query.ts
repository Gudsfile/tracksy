import { buildYearCondition } from '../../../../db/queries/buildYearCondition'

export type SessionAnalysisDetailedResult = {
    session_id: number
    track_count: number
    duration_ms: number
    session_start: string
    session_end: string
    day_of_week: number
}

export function buildSessionAnalysisDetailedQuery(
    year: number | undefined
): string {
    const yearCondition = buildYearCondition(year, 'year(session_start::date)')
    return `
        SELECT
            session_id::DOUBLE                              AS session_id,
            track_count::DOUBLE                             AS track_count,
            duration_ms::DOUBLE                             AS duration_ms,
            session_start::VARCHAR                          AS session_start,
            session_end::VARCHAR                            AS session_end,
            dayofweek(session_start::timestamp)::INTEGER    AS day_of_week
        FROM stream_sessions
        WHERE ${yearCondition}
        ORDER BY session_start
    `
}
