import type { Granularity } from './types'

export function formatBarLabel(
    timestamp: string,
    index: number,
    data: { ts: string }[],
    year: number | undefined,
    granularity: Granularity,
    locale: string | undefined = undefined
): string {
    const date = new Date(timestamp)

    if (granularity === 'year') return String(date.getUTCFullYear())

    if (granularity === 'month') {
        if (year !== undefined)
            return date.toLocaleDateString(locale, { month: 'short' })
        return date.getUTCMonth() === 0 ? String(date.getUTCFullYear()) : ''
    }

    if (granularity === 'week') {
        if (index === 0)
            return date.toLocaleDateString(locale, { month: 'short' })
        const prev = new Date(data[index - 1].ts)
        return date.getUTCMonth() !== prev.getUTCMonth()
            ? date.toLocaleDateString(locale, { month: 'short' })
            : ''
    }

    // day
    return date.getUTCDate() === 1
        ? date.toLocaleDateString(locale, { month: 'short' })
        : ''
}
