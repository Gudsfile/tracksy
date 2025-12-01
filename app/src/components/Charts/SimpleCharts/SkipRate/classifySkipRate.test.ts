import { describe, expect, it } from 'vitest'
import { classifySkipRate } from './classifySkipRate'

describe('classifySkipRate', () => {
    it('should classify as Impatient when skip rate is below threshold', () => {
        const result = classifySkipRate(40)

        expect(result.classification).toBe('Impatient')
        expect(result.emoji).toBe('⏭️')
        expect(result.message).toBe('You skip often!')
    })

    it('should classify as Patient when skip rate is above threshold', () => {
        const result = classifySkipRate(80)

        expect(result.classification).toBe('Patient')
        expect(result.emoji).toBe('🧘')
        expect(result.message).toBe('You savor every note!')
    })

    it('should classify as Normal when skip rate is between thresholds', () => {
        const result = classifySkipRate(55)

        expect(result.classification).toBe('Normal')
        expect(result.emoji).toBe('😐')
        expect(result.message).toBe('You have an equilibrated listening.')
    })
})
