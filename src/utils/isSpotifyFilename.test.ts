import { it, expect } from 'vitest'

import { isSpotifyFilename } from './isSpotifyFilename'

it.each([
    'Streaming_History_Audio_2024-2025_10.json',
    'Streaming_History_Audio_2024-2025_100.json',
    'Streaming_History_Audio_2024-2025_1000.json',
    'Streaming_History_Audio_2024.json',
])('should return true if %s is Spotify filename', (filename) => {
    expect(isSpotifyFilename(new File(['file content'], filename))).toBe(true)
})

it.each(['Streaming_2024-2025_1000.json', 'History_Audio_2024-2025_1000.json'])(
    'should return false if %s is not Spotify filename',
    (filename) => {
        expect(isSpotifyFilename(new File(['file content'], filename))).toBe(
            false
        )
    }
)
