import { describe, it, expect } from 'vitest'
import {
    detectProvider,
    getSupportedProviderNames,
    isAllowedFileContentType,
    isFileSupported,
} from './index'

describe('StreamProvider Factory', () => {
    describe('detectProvider', () => {
        it('should detect Spotify files', () => {
            const file = new File([], 'Streaming_History_Audio_2024.json')
            const streamProvider = detectProvider(file)

            expect(streamProvider).not.toBeUndefined()
            expect(streamProvider?.name).toBe('spotify')
        })

        it('should detect Deezer files', () => {
            const file = new File([], 'deezer-data_1234567890.xlsx')
            const streamProvider = detectProvider(file)

            expect(streamProvider).not.toBeUndefined()
            expect(streamProvider?.name).toBe('deezer')
        })

        it('should detect FunkWhale files', () => {
            const file = new File([], 'funkwhale-history.json')
            const streamProvider = detectProvider(file)

            expect(streamProvider).not.toBeUndefined()
            expect(streamProvider?.name).toBe('funkwhale')
        })

        it('should return undefined for unknown file formats', () => {
            const file = new File([], 'unknown_format.json')
            const streamProvider = detectProvider(file)

            expect(streamProvider).toBeUndefined()
        })
    })

    describe('getSupportedProviderNames', () => {
        it('returns a non-empty array of display names', () => {
            const names = getSupportedProviderNames()
            expect(names.length).toBeGreaterThan(0)
            expect(
                names.every((n) => typeof n === 'string' && n.length > 0)
            ).toBe(true)
        })

        it('returns one entry per registered provider with format hint', () => {
            const names = getSupportedProviderNames()
            expect(names.length).toBe(3)
            expect(names).toContain('Spotify (ZIP/JSON)')
            expect(names).toContain('Deezer (XLSX)')
            expect(names).toContain('FunkWhale (JSON)')
        })
    })

    describe('isFileSupported', () => {
        it('should return true for supported files', () => {
            const file = new File([], 'Streaming_History_Audio_2024.json')
            expect(isFileSupported(file)).toBe(true)
        })

        it('should return false for unsupported files', () => {
            const file = new File([], 'unsupported.json')
            expect(isFileSupported(file)).toBe(false)
        })
    })

    describe('isAllowedFileContentType', () => {
        it.each([
            'application/json',
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        ])(
            'should return true if the file content type %s is allowed',
            (contentType) => {
                const file = new File([], 'filename', { type: contentType })
                expect(isAllowedFileContentType(file)).toBe(true)
            }
        )

        it.each([
            'image/png',
            'image/jpeg',
            'text/plain',
            'text/html',
            'application/pdf',
            'application/msword',
            'application/vnd.ms-excel',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        ])(
            'should return false if the file content type %s is disallowed',
            (contentType) => {
                const file = new File([], 'filename', { type: contentType })
                expect(isAllowedFileContentType(file)).toBe(false)
            }
        )
    })
})
