import type { Granularity } from './types'

export function formatBarLabel(
    timestamp: string,
    prevTimestamp: string | undefined,
    year: number | undefined,
    granularity: Granularity,
    locale?: string
): string {
    const date = new Date(timestamp)

    if (granularity === 'year') return String(date.getUTCFullYear())

    if (granularity === 'month') {
        if (year !== undefined)
            return date.toLocaleDateString(locale, { month: 'short' })
        return date.getUTCMonth() === 0 ? String(date.getUTCFullYear()) : ''
    }

    if (granularity === 'week') {
        const prev = prevTimestamp ? new Date(prevTimestamp) : null
        if (!prev) return date.toLocaleDateString(locale, { month: 'short' })
        return date.getUTCMonth() !== prev.getUTCMonth()
            ? date.toLocaleDateString(locale, { month: 'short' })
            : ''
    }

    // day
    return date.getUTCDate() === 1
        ? date.toLocaleDateString(locale, { month: 'short' })
        : ''
}
