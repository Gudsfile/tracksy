import { describe, it, expect } from 'vitest'
import { formatMonthYear } from './formatMonthYear'

describe('StreamPerMonth formatMonthYear', () => {
    it('should return month year formatted date', () => {
        const may_2006 = new Date('2006-05-01')
        const result = formatMonthYear(may_2006)
        expect(result).toBe('May 2006')
    })
})
