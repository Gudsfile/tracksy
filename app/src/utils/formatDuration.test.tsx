import { describe, it, expect } from 'vitest'
import { formatDuration } from './formatDuration'

describe('FormatDuration', () => {
    it.each([
        { ms: 0, expected: '0s' },
        { ms: 1000, expected: '1s' },
        { ms: 61000, expected: '1m 1s' },
        { ms: 3600000, expected: '1h 0m 0s' },
        { ms: 3661000, expected: '1h 1m 1s' },
        { ms: 86399000, expected: '23h 59m 59s' },
        { ms: 86400000, expected: '1d 0h 0m 0s' },
        { ms: 172800000, expected: '2d 0h 0m 0s' },
    ])('should format $ms ms as "$expected"', ({ ms, expected }) => {
        expect(formatDuration(ms)).toBe(expected)
    })
})
