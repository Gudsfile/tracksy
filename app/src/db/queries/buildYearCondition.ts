import { TABLE } from './constants'

export type YearCondition = {
    condition: string
    params: unknown[]
}

/**
 * Builds a parameterized SQL WHERE condition fragment for filtering by year.
 *
 * Returns a no-op condition ('1=1') with no params when year is undefined,
 * or a prepared-statement placeholder ('year(ts::date) = ?') with the year
 * value when defined. This keeps SQL structure separate from values.
 */
export function buildYearCondition(year: number | undefined): YearCondition {
    if (year === undefined) return { condition: '1=1', params: [] }
    return { condition: 'year(ts::date) = ?', params: [Math.trunc(year)] }
}

/**
 * Builds a SQL expression that resolves to the given year as a number,
 * or falls back to the most recent year in the table when year is undefined.
 *
 * Note: the undefined fallback is a subquery and cannot be parameterized.
 */
export function buildYearOrLatest(year: number | undefined): string {
    if (year !== undefined) return String(Math.trunc(year))
    return `(select max(year(ts::date)) from ${TABLE})`
}
