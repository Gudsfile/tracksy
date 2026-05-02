import { describe, it, expect } from 'vitest'
import { buildYearCondition, buildYearOrLatest } from './buildYearCondition'
import { TABLE } from './constants'

describe('buildYearCondition', () => {
    it('returns a no-op condition with no params when year is undefined', () => {
        const result = buildYearCondition(undefined)
        expect(result.condition).toBe('1=1')
        expect(result.params).toEqual([])
    })

    it('returns a parameterized condition with the year as param', () => {
        const result = buildYearCondition(2024)
        expect(result.condition).toBe('year(ts::date) = ?')
        expect(result.params).toEqual([2024])
    })

    it('truncates fractional years to integers', () => {
        const result = buildYearCondition(2024.9)
        expect(result.params).toEqual([2024])
    })
})

describe('buildYearOrLatest', () => {
    it('returns the year as a string when year is defined', () => {
        expect(buildYearOrLatest(2024)).toBe('2024')
    })

    it('truncates fractional years', () => {
        expect(buildYearOrLatest(2024.9)).toBe('2024')
    })

    it('returns a max-year subquery when year is undefined', () => {
        const result = buildYearOrLatest(undefined)
        expect(result).toContain('select max(year(ts::date))')
        expect(result).toContain(TABLE)
    })
})
