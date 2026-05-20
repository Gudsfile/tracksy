import { describe, expect, it } from 'vitest'

import { getSupportedProviderNames } from '../streamProvider'
import { getUserMessage, UPLOAD_ERROR } from './uploadErrorMessages'

describe('getUserMessage', () => {
    it('returns unsupported file type message for unsupported content type error', () => {
        const error = new Error(UPLOAD_ERROR.UNSUPPORTED_CONTENT_TYPE)
        const expected = `Unsupported file type. Supported: ${getSupportedProviderNames().join(', ')}.`
        expect(getUserMessage(error)).toBe(expected)
    })

    it('returns empty archive message for no files found in archive error', () => {
        const error = new Error(UPLOAD_ERROR.NO_FILES_IN_ARCHIVE)
        expect(getUserMessage(error)).toBe(
            'The ZIP archive is empty or unreadable.'
        )
    })

    it('returns unrecognized export message for no valid stream records error', () => {
        const error = new Error(UPLOAD_ERROR.NO_VALID_RECORDS)
        const expected = `No streaming export recognized. Supported: ${getSupportedProviderNames().join(', ')}.`
        expect(getUserMessage(error)).toBe(expected)
    })

    it('returns no file received message for no file to process error', () => {
        const error = new Error(UPLOAD_ERROR.NO_FILE_TO_PROCESS)
        expect(getUserMessage(error)).toBe('No file received. Try again.')
    })

    it('returns generic fallback message for unknown errors', () => {
        const error = new Error('Something unexpected happened')
        expect(getUserMessage(error)).toBe(
            'Upload failed. Check the file and try again.'
        )
    })

    it('returns generic fallback message for non-Error values', () => {
        expect(getUserMessage('some string error')).toBe(
            'Upload failed. Check the file and try again.'
        )
        expect(getUserMessage(null)).toBe(
            'Upload failed. Check the file and try again.'
        )
        expect(getUserMessage(undefined)).toBe(
            'Upload failed. Check the file and try again.'
        )
    })
})
