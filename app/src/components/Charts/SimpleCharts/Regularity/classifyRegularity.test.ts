import { describe, expect, it } from 'vitest'
import { classifyRegularity } from './classifyRegularity'

describe('classifyRegularity', () => {
    it('should classify skip rate', () => {
        expect(classifyRegularity(80).label).toBe('Constant')
        expect(classifyRegularity(70).label).toBe('Regular')
        expect(classifyRegularity(40).label).toBe('Regular')
        expect(classifyRegularity(30).label).toBe('Occasional')
        expect(classifyRegularity(10).label).toBe('Occasional')
    })
})
