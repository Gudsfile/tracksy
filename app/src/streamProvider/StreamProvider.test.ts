import { describe, it, expect, vi } from 'vitest'
import { StreamProvider } from './StreamProvider'
import type { StreamRecord } from './types'
import * as validation from './validation'

type TestRawData = {
    foo: string
}

class TestProvider extends StreamProvider<TestRawData> {
    name = 'test'
    displayName = 'Test Provider'
    filePattern = /.*/
    fileContentType = 'application/json'

    readFile = vi.fn(async (): Promise<TestRawData[]> => [{ foo: 'bar' }])

    transform = vi.fn(() => [
        {
            track_uri: 'uri',
            track_name: 'track',
            artist_name: 'artist',
            album_name: 'album',
            ts: '2006-04-23',
            ms_played: 40000,
            platform: 'dummy',
            extra: 'should be preserved',
        } satisfies StreamRecord & { extra: string },
    ])
}

describe('processFile pipeline', () => {
    it('should process a file and return cleaned, validated and filtered records', async () => {
        const provider = new TestProvider()

        vi.spyOn(validation, 'isValidStreamRecord').mockReturnValue(true)
        vi.spyOn(validation, 'isLongEnoughStream').mockReturnValue(true)

        const result = await provider.processFile(new File([''], 'test.json'))

        expect(result).toHaveLength(1)
        expect(result[0]).toHaveProperty('extra', 'should be preserved')

        expect(provider.transform).toHaveBeenCalledWith([{ foo: 'bar' }])
        expect(validation.isValidStreamRecord).toHaveBeenCalledTimes(1)
        expect(validation.isLongEnoughStream).toHaveBeenCalledTimes(1)
    })
})
