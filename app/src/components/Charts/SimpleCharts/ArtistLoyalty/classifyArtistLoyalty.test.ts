import { describe, it, expect } from 'vitest'
import { classifyArtistLoyalty } from './classifyArtistLoyalty'
import type { ArtistLoyaltyResult } from './query'

describe('classifyArtistLoyalty', () => {
    const makeData = (
        shares: Partial<Record<ArtistLoyaltyResult['stream_bin'], number>>
    ): ArtistLoyaltyResult[] => {
        return ['1', '2-10', '11-100', '101-1000', '1000+'].map((bin) => ({
            stream_bin: bin,
            artist_count: 1,
            streams_in_bin: 1,
            share_of_total_streams: shares[bin] ?? 0,
        }))
    }

    it('should classify as Ultra Loyal when high engagement > 0.6', () => {
        const data = makeData({
            '101-1000': 0.4,
            '1000+': 0.3,
        })
        const result = classifyArtistLoyalty(data)
        expect(result.label).toBe('Ultra Loyal')
        expect(result.emoji).toBe('🔥')
    })

    it('should classify as Explorer when low engagement > 0.6', () => {
        const data = makeData({
            '1': 0.4,
            '2-10': 0.3,
        })
        const result = classifyArtistLoyalty(data)
        expect(result.label).toBe('Explorer')
        expect(result.emoji).toBe('🔍')
    })

    it('should classify as Favorites Driven when high engagement > low engagement', () => {
        const data = makeData({
            '1': 0.2,
            '2-10': 0.1,
            '101-1000': 0.3,
            '1000+': 0.2,
        })
        const result = classifyArtistLoyalty(data)
        expect(result.label).toBe('Favorites Driven')
        expect(result.emoji).toBe('❤️')
    })

    it('should classify as Balanced Regular when mid engagement > 0.4', () => {
        const data = makeData({
            '11-100': 0.5,
        })
        const result = classifyArtistLoyalty(data)
        expect(result.label).toBe('Balanced Regular')
        expect(result.emoji).toBe('⚖️')
    })

    it('should classify as Curious for all other cases', () => {
        const data = makeData({
            '1': 0.1,
            '2-10': 0.1,
            '11-100': 0.2,
            '101-1000': 0.1,
            '1000+': 0.1,
        })
        const result = classifyArtistLoyalty(data)
        expect(result.label).toBe('Curious')
        expect(result.emoji).toBe('🧐')
    })

    it('should handle empty data', () => {
        const result = classifyArtistLoyalty([])
        expect(result.label).toBe('Curious')
        expect(result.emoji).toBe('🧐')
    })
})
