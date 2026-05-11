export type CustomChartType = 'metric' | 'bar' | 'line' | 'list' | 'table'

export type DBRow = Record<string, string | number | null>

function isNumeric(v: unknown): boolean {
    return typeof v === 'number' && Number.isFinite(v)
}

function isDateLike(v: unknown): boolean {
    if (typeof v !== 'string' && typeof v !== 'number') return false
    const parsed = new Date(v as string)
    return !Number.isNaN(parsed.getTime())
}

export function inferChartType(rows: DBRow[]): CustomChartType {
    if (!rows || rows.length === 0) return 'table'

    const first = rows[0]
    const keys = Object.keys(first)

    // Single value → metric
    if (rows.length === 1 && keys.length === 1 && isNumeric(first[keys[0]])) {
        return 'metric'
    }

    // Two columns + one string + one number → list (ranked) or bar
    if (keys.length === 2) {
        const [k1, k2] = keys
        const stringKey =
            typeof first[k1] === 'string'
                ? k1
                : typeof first[k2] === 'string'
                  ? k2
                  : undefined
        const numericKey = isNumeric(first[k1])
            ? k1
            : isNumeric(first[k2])
              ? k2
              : undefined

        if (stringKey && numericKey) {
            // Date-like first column with many rows → line
            if (isDateLike(first[stringKey]) && rows.length > 6) {
                return 'line'
            }
            // Ranked list ≤ 25 rows
            if (rows.length <= 25) return 'list'
            return 'bar'
        }
    }

    return 'table'
}
