import { TABLE } from './constants'

/**
 * Builds a SQL WHERE condition fragment for filtering by year.
 *
 * Returns '1=1' (no-op) when year is undefined, allowing callers to
 * unconditionally include the condition in their queries.
 */
export function buildYearCondition(year: number | undefined): string {
    if (year === undefined) return '1=1'
    return `year(ts::date) = ${Math.trunc(year)}`
}

/**
 * Builds a SQL expression that resolves to the given year as a number,
 * or falls back to the most recent year in the table when year is undefined.
 */
export function buildYearOrLatest(year: number | undefined): string {
    if (year !== undefined) return String(Math.trunc(year))
    return `(select max(year(ts::date)) from ${TABLE})`
}
