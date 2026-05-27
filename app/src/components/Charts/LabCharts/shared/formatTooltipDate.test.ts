import { describe, it, expect } from 'vitest'
import { formatTooltipDate } from './formatTooltipDate'

const LOCALE = 'en-US'

describe('formatTooltipDate', () => {
    const date = new Date('2024-06-15T00:00:00Z')

    it('year granularity returns year only', () => {
        expect(formatTooltipDate(date, 'year')).toBe('2024')
    })

    it('month granularity returns month and year', () => {
        const result = formatTooltipDate(date, 'month')
        expect(result).toContain('2024')
        expect(result.toLowerCase()).toContain('june')
    })

    it('week granularity returns month, day, and year', () => {
        const result = formatTooltipDate(date, 'week')
        expect(result).toContain('2024')
        expect(result).toContain('15')
    })

    it('day granularity returns month, day, and year', () => {
        const result = formatTooltipDate(date, 'day')
        expect(result).toContain('2024')
        expect(result).toContain('15')
    })
})
