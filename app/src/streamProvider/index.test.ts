import { describe, it, expect } from 'vitest'
import {
    detectProvider,
    isFileSupported,
    isAllowedFileContentType,
} from './index'

describe('StreamProvider Factory', () => {
    describe('detectProvider', () => {
        it('should detect Spotify files', () => {
            const file = new File([], 'Streaming_History_Audio_2024.json')
            const streamProvider = detectProvider(file)

            expect(streamProvider).not.toBeUndefined()
            expect(streamProvider?.name).toBe('spotify')
        })

        it('should return undefined for unknown file formats', () => {
            const file = new File([], 'unknown_format.json')
            const streamProvider = detectProvider(file)

            expect(streamProvider).toBeUndefined()
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
        it.each(['application/json'])(
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
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        ])(
            'should return false if the file content type %s is disallowed',
            (contentType) => {
                const file = new File([], 'filename', { type: contentType })
                expect(isAllowedFileContentType(file)).toBe(false)
            }
        )
    })
})
