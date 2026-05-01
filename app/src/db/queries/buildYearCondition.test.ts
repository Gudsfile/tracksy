import { describe, it, expect } from 'vitest'
import { buildYearCondition, buildYearOrLatest } from './buildYearCondition'
import { TABLE } from './constants'

describe('buildYearCondition', () => {
    it('returns a no-op condition when year is undefined', () => {
        expect(buildYearCondition(undefined)).toBe('1=1')
    })

    it('returns an integer condition for a given year', () => {
        expect(buildYearCondition(2024)).toBe('year(ts::date) = 2024')
    })

    it('truncates fractional years to integers', () => {
        expect(buildYearCondition(2024.9)).toBe('year(ts::date) = 2024')
    })

    it('uses a custom column expression when provided', () => {
        expect(buildYearCondition(2024, 'ranked_streams.year')).toBe(
            'ranked_streams.year = 2024'
        )
    })

    it('returns a no-op condition with a custom column when year is undefined', () => {
        expect(buildYearCondition(undefined, 'ranked_streams.year')).toBe('1=1')
    })
})

describe('buildYearOrLatest', () => {
    it('returns the year as a string when year is defined', () => {
        expect(buildYearOrLatest(2024)).toBe('2024')
    })

    it('truncates fractional years to integers', () => {
        expect(buildYearOrLatest(2024.9)).toBe('2024')
    })

    it('returns a max-year subquery when year is undefined', () => {
        const result = buildYearOrLatest(undefined)
        expect(result).toContain('select max(year(ts::date))')
        expect(result).toContain(TABLE)
    })
})
