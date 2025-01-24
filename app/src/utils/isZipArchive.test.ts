import { it, expect } from 'vitest'

import { isZipArchive } from './isZipArchive'

it('should return true if the file content type %s is a zip archive', () => {
    const fileMock = new File([''], 'filename', { type: 'application/zip' })
    expect(isZipArchive(fileMock)).toBe(true)
})

it.each(['application/pdf', 'image/png', 'text/plain', 'application/json'])(
    'should return false if the file content type %s is not a zip archive',
    (contentType) => {
        const fileMock = new File([''], 'filename', { type: contentType })
        expect(isZipArchive(fileMock)).toBe(false)
    }
)
