import type { Granularity } from './types'

export function formatTooltipDate(
    timestamp: string,
    granularity: Granularity,
    locale: string | undefined = undefined
): string {
    const date = new Date(timestamp)
    if (granularity === 'year')
        return date.toLocaleDateString(locale, { year: 'numeric' })
    if (granularity === 'month')
        return date.toLocaleDateString(locale, {
            month: 'long',
            year: 'numeric',
        })
    return date.toLocaleDateString(locale, {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
    })
}
