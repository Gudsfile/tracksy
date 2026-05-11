import { describe, it, expect, vi, beforeEach } from 'vitest'
import { openArchive } from './openArchive'
import { Archive } from 'libarchive.js'

describe('openArchive', () => {
    beforeEach(() => {
        vi.restoreAllMocks()
    })

    it('should initialize Archive and open the file', async () => {
        vi.spyOn(Archive, 'init').mockReturnValue({})
        vi.spyOn(Archive, 'open').mockResolvedValue('archive-instance' as never)

        const file = new File(['test'], 'test.zip')
        const result = await openArchive(file)

        expect(Archive.init).toHaveBeenCalledWith({
            workerUrl: expect.any(String),
        })
        expect(Archive.open).toHaveBeenCalledWith(file)
        expect(result).toBe('archive-instance')
    })
})
