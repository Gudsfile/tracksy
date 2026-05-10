import { describe, it, expect } from 'vitest'
import { clockEmoji } from './clockEmojis'

describe('clockEmoji', () => {
    it('returns 🕛 for midnight (0)', () => {
        expect(clockEmoji(0)).toBe('🕛')
    })

    it('returns 🕐 for 1 AM (1)', () => {
        expect(clockEmoji(1)).toBe('🕐')
    })

    it('returns 🕛 for noon (12)', () => {
        expect(clockEmoji(12)).toBe('🕛')
    })

    it('returns 🕐 for 1 PM (13)', () => {
        expect(clockEmoji(13)).toBe('🕐')
    })

    it('returns 🕚 for 11 PM (23)', () => {
        expect(clockEmoji(23)).toBe('🕚')
    })
})
