import { SUMMARIZE_CACHE_TABLE } from '../../../db/queries/constants'
import sqlQuerySummarize from './Summarize.sql?raw'

export const summarizeQuery = sqlQuerySummarize.replaceAll(
    '${table}',
    SUMMARIZE_CACHE_TABLE
)

export type SummarizeDataQueryResult = {
    min_datetime: string
    max_datetime: string
    max_count_hourly_stream: number
    max_monthly_duration: number
}
