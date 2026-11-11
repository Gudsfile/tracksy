import { describe, expect, it, vi } from 'vitest'
import { newSpanId, newTraceId } from './ids.js'

describe('newTraceId', () => {
    it('is 32 lowercase hex characters', () => {
        expect(newTraceId()).toMatch(/^[0-9a-f]{32}$/)
    })

    it('does not repeat', () => {
        const ids = new Set(Array.from({ length: 100 }, newTraceId))
        expect(ids.size).toBe(100)
    })
})

describe('newSpanId', () => {
    it('is 16 lowercase hex characters', () => {
        expect(newSpanId()).toMatch(/^[0-9a-f]{16}$/)
    })

    it('does not repeat', () => {
        const ids = new Set(Array.from({ length: 100 }, newSpanId))
        expect(ids.size).toBe(100)
    })
})

describe('all-zero guard', () => {
    it('never emits the invalid all-zero id', () => {
        // Force the pathological case the spec forbids: a CSPRNG that returns
        // only zero bytes. Without the guard both ids would be invalid.
        vi.spyOn(crypto, 'getRandomValues').mockImplementation((array) => {
            new Uint8Array(
                (array as Uint8Array).buffer,
                (array as Uint8Array).byteOffset,
                (array as Uint8Array).byteLength
            ).fill(0)
            return array
        })

        expect(newTraceId()).toBe('01'.padEnd(32, '0'))
        expect(newSpanId()).toBe('01'.padEnd(16, '0'))
    })
})
