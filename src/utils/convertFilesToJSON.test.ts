import { it, expect, describe } from 'vitest'

import { convertFilesToJSON } from './convertFilesToJSON'
import { convertArrayToFileList } from './convertArrayToFileList'

/**
 * FIXME: Disabled due to JSDOM not supporting full File API : https://developer.mozilla.org/en-US/docs/Web/API/Blob/text
 * missing File.text method
 * https://github.com/jsdom/jsdom/blob/04541b377d9949d6ab56866760b7883a23db0577/lib/jsdom/living/file-api/Blob-impl.js#L11
 */
describe.skip('convertFilesToJSON', () => {
    it('should convert a single file to JSON', async () => {
        const files = convertArrayToFileList([
            new File(['{"key": "value"}'], 'test.json', {
                type: 'application/json',
            }),
        ])
        const result = await convertFilesToJSON(files)
        expect(result).toEqual([{ key: 'value' }])
    })

    it('should convert multiple files to JSON', async () => {
        const files = convertArrayToFileList([
            new File(['{"key1": "value1"}'], 'test1.json', {
                type: 'application/json',
            }),
            new File(['{"key2": "value2"}'], 'test2.json', {
                type: 'application/json',
            }),
        ])

        const result = await convertFilesToJSON(files)
        expect(result).toEqual([{ key1: 'value1' }, { key2: 'value2' }])
    })

    it('should handle empty file list', async () => {
        const files = convertArrayToFileList([])

        const result = await convertFilesToJSON(files)
        expect(result).toEqual([])
    })

    it('should throw an error for invalid JSON', async () => {
        const files = convertArrayToFileList([
            new File(['invalid json'], 'test.json', {
                type: 'application/json',
            }),
        ])

        await expect(convertFilesToJSON(files)).rejects.toThrow(SyntaxError)
    })
})
