import type { Granularity } from './types'

export function formatTooltipDate(
    date: Date,
    granularity: Granularity
): string {
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
