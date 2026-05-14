import { describe, it, expect } from 'vitest'
import { resolveYear } from './resolveYear'

const Y = new Date().getFullYear()

describe('resolveYear', () => {
    it('resolves "last year"', () =>
        expect(resolveYear('My top tracks for last year')).toBe(Y - 1))
    it('resolves "Last Year" (case insensitive)', () =>
        expect(resolveYear('Last Year favourites')).toBe(Y - 1))
    it('resolves "this year"', () =>
        expect(resolveYear('top artists this year')).toBe(Y))
    it('resolves "current year"', () =>
        expect(resolveYear('streams current year')).toBe(Y))
    it('resolves explicit 4-digit year', () =>
        expect(resolveYear('top tracks in 2022')).toBe(2022))
    it('returns undefined when no year', () =>
        expect(resolveYear('who are my top artists')).toBeUndefined())
    it('"last year" beats bare number', () =>
        expect(resolveYear('last year compared to 2020')).toBe(Y - 1))
    it('returns undefined for "next year"', () =>
        expect(
            resolveYear('what will my top artists be next year')
        ).toBeUndefined())
})
