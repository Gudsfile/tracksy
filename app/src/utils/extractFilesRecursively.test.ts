import { describe, it, expect, vi, beforeEach } from 'vitest'
import { extractFilesRecursively } from './extractFilesRecursively'
import * as openArchiveModule from './openArchive'

function makeFile(name: string, content = 'data'): File {
    return new File([content], name)
}

function makeZipFile(name: string): File {
    return new File(['zip-bytes'], name, { type: 'application/zip' })
}

function mockArchive(files: Record<string, File | Record<string, File>>) {
    return {
        extractFiles: vi.fn().mockResolvedValue(files),
    }
}

describe('extractFilesRecursively', () => {
    beforeEach(() => {
        vi.restoreAllMocks()
    })

    it('should extract flat files from a ZIP', async () => {
        const csv = makeFile('Apple Music Play Activity.csv')
        vi.spyOn(openArchiveModule, 'openArchive').mockResolvedValue(
            mockArchive({ 'Apple Music Play Activity.csv': csv }) as never
        )

        const result = await extractFilesRecursively(makeZipFile('export.zip'))

        expect(result).toHaveLength(1)
        expect(result[0].name).toBe('Apple Music Play Activity.csv')
    })

    it('should flatten nested directories', async () => {
        const csv = makeFile('playback.csv')
        vi.spyOn(openArchiveModule, 'openArchive').mockResolvedValue(
            mockArchive({ folder: { 'playback.csv': csv } }) as never
        )

        const result = await extractFilesRecursively(makeZipFile('export.zip'))

        expect(result).toHaveLength(1)
        expect(result[0].name).toBe('playback.csv')
    })

    it('should filter __MACOSX entries at the top level', async () => {
        const csv = makeFile('data.csv')
        vi.spyOn(openArchiveModule, 'openArchive').mockResolvedValue(
            mockArchive({
                '__MACOSX/._data.csv': makeFile('._data.csv'),
                'data.csv': csv,
            }) as never
        )

        const result = await extractFilesRecursively(makeZipFile('export.zip'))

        expect(result).toHaveLength(1)
        expect(result[0].name).toBe('data.csv')
    })

    it('should recurse into nested ZIP files', async () => {
        const innerCsv = makeFile('Apple Music Play Activity.csv')
        const innerZip = makeZipFile('Apple_Media_Services.zip')

        const innerArchive = mockArchive({
            'Apple Music Play Activity.csv': innerCsv,
        })
        const outerArchive = mockArchive({
            'Apple_Media_Services.zip': innerZip,
        })

        vi.spyOn(openArchiveModule, 'openArchive')
            .mockResolvedValueOnce(outerArchive as never)
            .mockResolvedValueOnce(innerArchive as never)

        const result = await extractFilesRecursively(makeZipFile('export.zip'))

        expect(result).toHaveLength(1)
        expect(result[0].name).toBe('Apple Music Play Activity.csv')
    })

    it('should handle empty archive', async () => {
        vi.spyOn(openArchiveModule, 'openArchive').mockResolvedValue(
            mockArchive({}) as never
        )

        const result = await extractFilesRecursively(makeZipFile('empty.zip'))

        expect(result).toHaveLength(0)
    })
})
