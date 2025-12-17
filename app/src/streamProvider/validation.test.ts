import { describe, it, expect } from 'vitest'
import { isValidStreamRecord, isLongEnoughStream } from './validation'
import { StreamRecord } from './types'

describe('Validation', () => {
    const validRecord: StreamRecord = {
        ts: '2024-01-01T00:00:00Z',
        ms_played: 30000,
        master_metadata_track_name: 'Track Name',
        master_metadata_album_artist_name: 'Artist Name',
        spotify_track_uri: 'spotify:track:1234567890',
    }

    describe('isValidStreamRecord', () => {
        it('should validate a complete stream record', () => {
            expect(isValidStreamRecord(validRecord)).toBe(true)
        })

        // prettier-ignore
        it.each([
            ['without ts', { ...validRecord, ts: undefined }],
            ['without ms_played', { ...validRecord, ms_played: undefined }],
            ['without master_metadata_track_name', { ...validRecord, master_metadata_track_name: undefined }],
            ['without master_metadata_album_artist_name', { ...validRecord, master_metadata_album_artist_name: undefined }],
            ['without spotify_track_uri', { ...validRecord, spotify_track_uri: undefined }],
        ])('should invalidate stream record %s', (_description, record) => {
            expect(isValidStreamRecord(record)).toBe(false)
        })
    })

    describe('isLongEnoughStream', () => {
        it('should validate valid stream records', () => {
            expect(isLongEnoughStream(validRecord)).toBe(true)
        })

        it('should validate invalid stream records', () => {
            const record = { ...validRecord, ms_played: 29000 } // 29 seconds is not enough
            expect(isLongEnoughStream(record)).toBe(false)
        })
    })
})
