import { TABLE } from './constants'

/**
 * Builds a SQL WHERE condition fragment for filtering by year.
 *
 * Returns '1=1' (no-op) when year is undefined, allowing callers to
 * unconditionally include the condition in their queries.
 *
 * @param column - SQL column expression to compare against. Defaults to
 *   'year(ts::date)' for raw stream tables. Pass a pre-aggregated column
 *   name (e.g. 'ranked_streams.year') when filtering on a CTE that already
 *   extracts the year.
 */
export function buildYearCondition(
    year: number | undefined,
    column = 'year(ts::date)'
): string {
    if (year === undefined) return '1=1'
    return `${column} = ${Math.trunc(year)}`
}

/**
 * Builds a SQL expression that resolves to the given year as a number,
 * or falls back to the most recent year in the table when year is undefined.
 */
export function buildYearOrLatest(year: number | undefined): string {
    if (year !== undefined) return String(Math.trunc(year))
    return `(select max(year(ts::date)) from ${TABLE})`
}
