import { it, expect } from 'vitest'

import { extractMusicOnly, type StreamRecord } from './extractMusicOnly'

it('should keep only music streams', () => {
    const streamRecords: StreamRecord[] = [
        {
            spotify_track_uri: 'spotify:track:dummy',
        },
        {
            spotify_track_uri: null,
        },
        {
            spotify_track_uri: undefined,
        },
        {
            spotify_episode_uri: 'spotify:episode:dummy',
            spotify_track_uri: null,
        },
        {
            audiobook_uri: 'spotify:audiobook:dummy',
            spotify_track_uri: null,
        },
    ]
    const filteredStreams = extractMusicOnly(streamRecords)
    expect(filteredStreams.length).toBe(1)
    expect(filteredStreams[0].spotify_track_uri).toBe('spotify:track:dummy')
})
