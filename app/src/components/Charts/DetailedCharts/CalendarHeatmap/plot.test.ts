import { describe, it, expect } from 'vitest'
import { buildCells } from './plot'

describe('buildCells', () => {
    it('generates one cell per calendar day for the given year', () => {
        const cells = buildCells([], 2024)
        expect(cells).toHaveLength(366) // 2024 is a leap year
    })

    it('generates 365 cells for a non-leap year', () => {
        const cells = buildCells([], 2025)
        expect(cells).toHaveLength(365)
    })

    it('zero-fills days with no stream data', () => {
        const cells = buildCells([], 2025)
        expect(cells.every((c) => c.stream_count === 0)).toBe(true)
    })

    it('fills stream_count from the provided data', () => {
        const cells = buildCells([{ day: '2025-03-15', stream_count: 7 }], 2025)
        const target = cells.find((c) => c.date === '2025-03-15')
        expect(target?.stream_count).toBe(7)
    })

    it('leaves other days at zero when only one day has data', () => {
        const cells = buildCells([{ day: '2025-06-01', stream_count: 3 }], 2025)
        const others = cells.filter((c) => c.date !== '2025-06-01')
        expect(others.every((c) => c.stream_count === 0)).toBe(true)
    })

    it('assigns correct dayOfWeek for 2025-01-01 (Wednesday = 3)', () => {
        const cells = buildCells([], 2025)
        expect(cells[0].dayOfWeek).toBe(3)
    })

    it('assigns week 0 to the first day of the year', () => {
        const cells = buildCells([], 2025)
        expect(cells[0].week).toBe(0)
    })

    it('assigns increasing week numbers as the year progresses', () => {
        const cells = buildCells([], 2025)
        const weeks = cells.map((c) => c.week)
        for (let i = 1; i < weeks.length; i++) {
            expect(weeks[i]).toBeGreaterThanOrEqual(weeks[i - 1])
        }
    })
})
