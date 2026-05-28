import { describe, it, expect } from 'vitest'
import { formatBarLabel } from './formatBarLabel'

const LOCALE = 'en-US'

describe('formatBarLabel', () => {
    describe('year granularity', () => {
        it('returns the year', () => {
            expect(
                formatBarLabel(
                    '2024-06-15',
                    undefined,
                    undefined,
                    'year',
                    LOCALE
                )
            ).toBe('2024')
        })
    })

    describe('month granularity', () => {
        it('returns short month when year is set', () => {
            const result = formatBarLabel(
                '2024-06-01',
                undefined,
                2024,
                'month',
                LOCALE
            )
            expect(result.toLowerCase()).toContain('jun')
        })

        it('returns year string for January when no year filter', () => {
            expect(
                formatBarLabel(
                    '2024-01-01',
                    undefined,
                    undefined,
                    'month',
                    LOCALE
                )
            ).toBe('2024')
        })

        it('returns empty string for non-January when no year filter', () => {
            expect(
                formatBarLabel(
                    '2024-06-01',
                    undefined,
                    undefined,
                    'month',
                    LOCALE
                )
            ).toBe('')
        })
    })

    describe('week granularity', () => {
        it('returns short month when prevTimestamp is undefined (first item)', () => {
            const result = formatBarLabel(
                '2024-01-01',
                undefined,
                2024,
                'week',
                LOCALE
            )
            expect(result.toLowerCase()).toContain('jan')
        })

        it('returns short month when month changes', () => {
            const result = formatBarLabel(
                '2024-02-05',
                '2024-01-29',
                2024,
                'week',
                LOCALE
            )
            expect(result.toLowerCase()).toContain('feb')
        })

        it('returns empty string within same month', () => {
            expect(
                formatBarLabel('2024-06-08', '2024-06-01', 2024, 'week', LOCALE)
            ).toBe('')
        })
    })

    describe('day granularity', () => {
        it('returns short month on first day of month', () => {
            const result = formatBarLabel(
                '2024-06-01',
                undefined,
                2024,
                'day',
                LOCALE
            )
            expect(result.toLowerCase()).toContain('jun')
        })

        it('returns empty string for other days', () => {
            expect(
                formatBarLabel('2024-06-15', undefined, 2024, 'day', LOCALE)
            ).toBe('')
        })
    })

    describe('invalid timestamp', () => {
        it('does not throw', () => {
            expect(() =>
                formatBarLabel('not-a-date', undefined, undefined, 'month')
            ).not.toThrow()
        })
    })
})
