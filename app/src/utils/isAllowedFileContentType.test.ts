import { expect, it } from 'vitest'

import { isAllowedFileContentType } from './isAllowedFileContentType'

it.each(['application/zip', 'application/json', 'application/octet-stream'])(
    'should return true if the file content type %s is allowed',
    (contentType) => {
        const fileMock = new File([''], 'filename', { type: contentType })
        expect(isAllowedFileContentType(fileMock)).toBe(true)
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
    'should return false if the file content type %s is not allowed',
    (contentType) => {
        const fileMock = new File([''], 'filename', { type: contentType })
        expect(isAllowedFileContentType(fileMock)).toBe(false)
    }
)
