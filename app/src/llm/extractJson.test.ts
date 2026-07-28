import { describe, it, expect } from 'vitest'
import { extractJsonArray, extractJsonObject } from './extractJson'
import { LLMError } from './types'

describe('extractJsonObject', () => {
    it('returns the object as-is when not wrapped', () => {
        const out = extractJsonObject('{"intent":"top_artists","params":{}}')
        expect(JSON.parse(out)).toEqual({ intent: 'top_artists', params: {} })
    })

    it('strips ```json fences', () => {
        const out = extractJsonObject(
            '```json\n{"intent":"top_artists","params":{}}\n```'
        )
        expect(JSON.parse(out).intent).toBe('top_artists')
    })

    it('strips bare ``` fences', () => {
        const out = extractJsonObject(
            '```\n{"intent":"top_artists","params":{}}\n```'
        )
        expect(JSON.parse(out).intent).toBe('top_artists')
    })

    it('extracts a balanced object out of surrounding prose', () => {
        const out = extractJsonObject(
            'Here is the JSON: {"a": "{nested}", "b": 1} thanks!'
        )
        expect(JSON.parse(out)).toEqual({ a: '{nested}', b: 1 })
    })

    it('throws LLMError(parse) when no object is present', () => {
        expect(() => extractJsonObject('no json here')).toThrow(LLMError)
    })

    it('throws LLMError(parse) on unbalanced braces', () => {
        expect(() => extractJsonObject('{"a": 1')).toThrow(LLMError)
    })
})

describe('extractJsonArray', () => {
    it('returns the array as-is when not wrapped', () => {
        const out = extractJsonArray('[{"label":"A","question":"Q?"}]')
        expect(JSON.parse(out)).toEqual([{ label: 'A', question: 'Q?' }])
    })

    it('strips ```json fences and trailing prose', () => {
        const out = extractJsonArray(
            'Sure!\n```json\n[{"label":"A"}]\n```\nHope that helps.'
        )
        expect(JSON.parse(out)).toEqual([{ label: 'A' }])
    })

    it('ignores brackets inside string values', () => {
        const out = extractJsonArray('["a [bracketed] label", "b"] done')
        expect(JSON.parse(out)).toEqual(['a [bracketed] label', 'b'])
    })

    it('throws LLMError(parse) when no array is present', () => {
        expect(() => extractJsonArray('{"not":"an array"}')).toThrow(LLMError)
    })

    it('throws LLMError(parse) on unbalanced brackets', () => {
        expect(() => extractJsonArray('[{"a": 1}')).toThrow(LLMError)
    })
})
