import { describe, expect, it } from 'vitest'
import { classifyRepeatBehavior } from './classifyRepeatBehavior'

describe('classifyRepeatBehavior', () => {
    it('should classify as Obsessive when repeat sequences exceed threshold', () => {
        const result = classifyRepeatBehavior(51)

        expect(result.classification).toBe('Obsessive')
        expect(result.emoji).toBe('🔥')
    })

    it('should classify as Variated when repeat sequences are below threshold', () => {
        const result = classifyRepeatBehavior(9)

        expect(result.classification).toBe('Variated')
        expect(result.emoji).toBe('🔀')
    })

    it('should classify as Moderate for middle-range repeat sequences', () => {
        const result = classifyRepeatBehavior(25)

        expect(result.classification).toBe('Moderate')
        expect(result.emoji).toBe('🔁')
    })

    it('should handle exact threshold values correctly', () => {
        const obsessiveResult = classifyRepeatBehavior(50)
        expect(obsessiveResult.classification).toBe('Moderate')

        const variatedResult = classifyRepeatBehavior(10)
        expect(variatedResult.classification).toBe('Moderate')
    })
})
