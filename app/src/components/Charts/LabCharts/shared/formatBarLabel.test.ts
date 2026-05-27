import { describe, it, expect } from 'vitest'
import { formatBarLabel } from './formatBarLabel'

const item = (ts: string) => ({ ts })

describe('formatBarLabel', () => {
    describe('year granularity', () => {
        it('returns the year', () => {
            expect(
                formatBarLabel(item('2024-06-15'), 0, [], undefined, 'year')
            ).toBe('2024')
        })
    })

    describe('month granularity', () => {
        it('returns short month when year is set', () => {
            const result = formatBarLabel(
                item('2024-06-01'),
                0,
                [],
                2024,
                'month',
                LOCALE
            )
            expect(result.toLowerCase()).toContain('jun')
        })

        it('returns year string for January when no year filter', () => {
            expect(
                formatBarLabel(item('2024-01-01'), 0, [], undefined, 'month')
            ).toBe('2024')
        })

        it('returns empty string for non-January when no year filter', () => {
            expect(
                formatBarLabel(item('2024-06-01'), 5, [], undefined, 'month')
            ).toBe('')
        })
    })

    describe('week granularity', () => {
        it('returns short month for first item', () => {
            const data = [item('2024-01-01'), item('2024-01-08')]
            const result = formatBarLabel(data[0], 0, data, 2024, 'week')
            expect(result.toLowerCase()).toContain('jan')
        })

        it('returns short month when month changes', () => {
            const data = [item('2024-01-29'), item('2024-02-05')]
            const result = formatBarLabel(data[1], 1, data, 2024, 'week')
            expect(result.toLowerCase()).toContain('feb')
        })

        it('returns empty string within same month', () => {
            const data = [item('2024-06-01'), item('2024-06-08')]
            expect(formatBarLabel(data[1], 1, data, 2024, 'week')).toBe('')
        })
    })

    describe('day granularity', () => {
        it('returns short month on first day of month', () => {
            const result = formatBarLabel(
                item('2024-06-01'),
                0,
                [],
                2024,
                'day',
                LOCALE
            )
            expect(result.toLowerCase()).toContain('jun')
        })

        it('returns empty string for other days', () => {
            expect(
                formatBarLabel(item('2024-06-15'), 14, [], 2024, 'day')
            ).toBe('')
        })
    })
})
