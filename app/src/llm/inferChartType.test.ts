import { describe, it, expect } from 'vitest'
import { inferChartType } from './inferChartType'

describe('inferChartType', () => {
    it('returns table for empty rows', () => {
        expect(inferChartType([])).toBe('table')
    })

    it('returns metric for single-row single-numeric', () => {
        expect(inferChartType([{ total: 1234 }])).toBe('metric')
    })

    it('returns list for two-column string + number, ≤25 rows', () => {
        const rows = Array.from({ length: 5 }, (_, i) => ({
            artist: `A${i}`,
            count: 100 - i,
        }))
        expect(inferChartType(rows)).toBe('list')
    })

    it('returns line for date-like first column with many rows', () => {
        const rows = Array.from({ length: 12 }, (_, i) => ({
            day: `2023-01-${String(i + 1).padStart(2, '0')}`,
            count: i,
        }))
        expect(inferChartType(rows)).toBe('line')
    })

    it('returns bar for two-column with > 25 rows of non-date', () => {
        const rows = Array.from({ length: 30 }, (_, i) => ({
            label: `L${i}`,
            count: i,
        }))
        expect(inferChartType(rows)).toBe('bar')
    })

    it('returns table for >2 columns', () => {
        expect(
            inferChartType([
                { a: 'x', b: 1, c: 2 },
                { a: 'y', b: 3, c: 4 },
            ])
        ).toBe('table')
    })

    it('returns table for two non-numeric columns', () => {
        expect(inferChartType([{ a: 'x', b: 'y' }])).toBe('table')
    })
})
