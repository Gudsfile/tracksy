import { describe, it, expect } from 'vitest'
import { parseCallerFrame } from './parseCallerFrame'

describe('parseCallerFrame', () => {
    it('extracts parent dir name for index.tsx files', () => {
        const stack = `Error\n    at http://localhost:4321/src/components/Charts/LabCharts/StreamDiscovery/index.tsx:22:10`
        expect(parseCallerFrame(stack)).toBe('StreamDiscovery')
    })

    it('extracts filename stem for named files', () => {
        const stack = `Error\n    at http://localhost:4321/src/components/Charts/LabView.tsx:32:5`
        expect(parseCallerFrame(stack)).toBe('LabView')
    })

    it('extracts deeply nested index.tsx', () => {
        const stack = `Error\n    at http://localhost:4321/src/components/Charts/LabCharts/Top10Evolution/index.tsx:11:10`
        expect(parseCallerFrame(stack)).toBe('Top10Evolution')
    })

    it('returns undefined when no components/ frame', () => {
        const stack = `Error\n    at fetchData (hooks/useDBQuery.ts:48:5)`
        expect(parseCallerFrame(stack)).toBeUndefined()
    })

    it('returns undefined for undefined input', () => {
        expect(parseCallerFrame(undefined)).toBeUndefined()
    })

    it('skips non-component frames and finds the right one', () => {
        const stack = [
            'Error',
            '    at queryDBAsJSON (queryDB.ts:9:5)',
            '    at fetchData (hooks/useDBQuery.ts:48:5)',
            '    at http://localhost:4321/src/components/Charts/LabCharts/FunFacts/index.tsx:36:10',
        ].join('\n')
        expect(parseCallerFrame(stack)).toBe('FunFacts')
    })
})
