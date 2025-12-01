import { describe, expect, it } from 'vitest'
import { classifyRegularity } from './classifyRegularity'

describe('classifyRegularity', () => {
    it('should classify skip rate', () => {
        expect(classifyRegularity(70).label).toBe('Constant')
        expect(classifyRegularity(30).label).toBe('Regular')
        expect(classifyRegularity(10).label).toBe('Occasional')
    })
})
