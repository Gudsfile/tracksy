import { describe, expect, it } from 'vitest'
import { defaultClock, toUnixNano } from './time.js'

describe('toUnixNano', () => {
    it('appends six zeros for a whole millisecond', () => {
        expect(toUnixNano(1_700_000_000_000)).toBe('1700000000000000000')
    })

    it('keeps sub-millisecond precision', () => {
        expect(toUnixNano(1_700_000_000_000.5)).toBe('1700000000000500000')
        expect(toUnixNano(1_700_000_000_000.25)).toBe('1700000000000250000')
    })

    it('does not lose the low digits to floating-point rounding', () => {
        // The point of building the string by concatenation: `1.7e12 * 1e6`
        // exceeds Number.MAX_SAFE_INTEGER, so multiplying would round the tail
        // away and every timestamp would end in zeros.
        const result = toUnixNano(1_700_000_000_123.456)
        expect(result).toMatch(/^1700000000123456\d{3}$/)
        expect(Number(result)).toBeGreaterThan(Number.MAX_SAFE_INTEGER)
    })

    it('reports exactly what the double holds, quantisation included', () => {
        // At epoch-millisecond magnitude a double keeps only ~11 fractional
        // bits, so the finest representable step is ~488 ns. `.456` is stored as
        // `.45605...`, and the conversion faithfully reflects that rather than
        // inventing precision the input never had.
        const input = 1_700_000_000_123.456
        const storedFractionNanos = Math.round(
            (input - Math.floor(input)) * 1_000_000
        )
        expect(toUnixNano(input)).toBe(
            `1700000000123${String(storedFractionNanos).padStart(6, '0')}`
        )
        // A one-nanosecond offset is below the representable step, so it is
        // indistinguishable from zero — by the clock, not by this function.
        expect(toUnixNano(1_700_000_000_000.000_001)).toBe(
            toUnixNano(1_700_000_000_000)
        )
    })

    it('carries instead of emitting an out-of-range nanosecond field', () => {
        // Rounds to a full millisecond; the nanosecond digits must not read
        // "1000000", which is not a valid sub-millisecond remainder.
        expect(toUnixNano(1_700_000_000_000.999_999_9)).toBe(
            '1700000000001000000'
        )
    })

    it('is always exactly six digits after the millisecond part', () => {
        for (const fraction of [0, 0.1, 0.25, 0.5, 0.999]) {
            expect(toUnixNano(1_700_000_000_000 + fraction)).toMatch(
                /^1700000000000\d{6}$/
            )
        }
    })
})

describe('defaultClock', () => {
    it('returns a plausible epoch time', () => {
        const before = Date.now()
        const observed = defaultClock()
        const after = Date.now()

        // A one-second slack either side: `performance.timeOrigin + now()` can
        // drift from `Date.now()` by a fraction of a millisecond.
        expect(observed).toBeGreaterThan(before - 1000)
        expect(observed).toBeLessThan(after + 1000)
    })

    it('does not go backwards', () => {
        const first = defaultClock()
        const second = defaultClock()
        expect(second).toBeGreaterThanOrEqual(first)
    })
})
