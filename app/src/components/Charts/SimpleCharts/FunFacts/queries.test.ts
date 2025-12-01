import { afterAll, beforeAll, beforeEach, describe, it, expect } from 'vitest'
import {
    queryAfternoonFavorite,
    queryEveningFavorite,
    queryNightFavorite,
    queryMorningFavorite,
    queryMarathon,
    queryOneHitWonder,
    queryWeekendFavorite,
    queryAbsoluteLoyalty,
    queryNostalgicReturn,
    queryVarietyDay,
    queryBingeListener,
    queryCurrentObsession,
    queryRecentDiscovery,
    queryPeakHour,
    querySubscribedArtist,
    queryMusicalAnniversary,
    queryFirstArtist,
    queryUnbeatableStreak,
    queryForgottenArtist,
    queryTrackProposition,
} from './queries'
import {
    createTestConnection,
    closeTestConnection,
    testQuery,
    createTestTable,
    type TestStreamEntry,
} from '../__tests__/test-utils'
import type { DuckDBConnection } from '@duckdb/node-api'

let conn: DuckDBConnection

describe('FunFacts queries', () => {
    beforeAll(async () => {
        conn = await createTestConnection()
    })

    afterAll(() => {
        closeTestConnection(conn)
    })

    describe('Favorite artist queries', () => {
        const testData: TestStreamEntry[] = [
            {
                ts: '2024-02-07T06:00:00',
                master_metadata_album_artist_name: 'top_morning_artist',
            },
            {
                ts: '2024-02-07T07:00:00',
                master_metadata_album_artist_name: 'top_morning_artist',
            },
            {
                ts: '2024-02-07T08:00:00',
                master_metadata_album_artist_name: 'morning_artist',
            },
            {
                ts: '2024-02-07T12:00:00',
                master_metadata_album_artist_name: 'top_afternoon_artist',
            },
            {
                ts: '2024-02-07T13:00:00',
                master_metadata_album_artist_name: 'afternoon_artist',
            },
            {
                ts: '2024-02-07T14:00:00',
                master_metadata_album_artist_name: 'top_afternoon_artist',
            },
            {
                ts: '2024-02-07T18:00:00',
                master_metadata_album_artist_name: 'evening_artist',
            },
            {
                ts: '2024-02-07T19:00:00',
                master_metadata_album_artist_name: 'top_evening_artist',
            },
            {
                ts: '2024-02-07T20:00:00',
                master_metadata_album_artist_name: 'top_evening_artist',
            },
            {
                ts: '2024-02-07T00:00:00',
                master_metadata_album_artist_name: 'top_night_artist',
            },
            {
                ts: '2024-02-07T01:00:00',
                master_metadata_album_artist_name: 'night_artist',
            },
            {
                ts: '2024-02-07T02:00:00',
                master_metadata_album_artist_name: 'top_night_artist',
            },
        ]

        beforeEach(async () => {
            await createTestTable(conn, testData)
        })

        it('queryMorningFavorite returns artist with most morning streams', async () => {
            const rows = await testQuery(conn, queryMorningFavorite())
            expect(rows.length).toBe(1)
            const row = rows[0]
            expect(row.factType).toBe('morning_favorite')
            expect(row.mainText).toBe('top_morning_artist')
            expect(row.value).toBe('2')
            expect(row.unit).toBe('streams')
            expect(row.context).toBe('between 6am and 12pm')
        })

        it('queryAfternoonFavorite returns artist with most afternoon streams', async () => {
            const rows = await testQuery(conn, queryAfternoonFavorite())
            expect(rows.length).toBe(1)
            const row = rows[0]
            expect(row.factType).toBe('afternoon_favorite')
            expect(row.mainText).toBe('top_afternoon_artist')
            expect(row.value).toBe('2')
            expect(row.unit).toBe('streams')
            expect(row.context).toBe('between 12pm and 6pm')
        })

        it('queryEveningFavorite returns artist with most evening streams', async () => {
            const result = await conn.runAndReadAll(queryEveningFavorite())
            const rows = result.getRowObjectsJson()
            expect(rows.length).toBe(1)
            const row = rows[0]
            expect(row.factType).toBe('evening_favorite')
            expect(row.mainText).toBe('top_evening_artist')
            expect(row.value).toBe('2')
            expect(row.unit).toBe('streams')
            expect(row.context).toBe('between 6pm and 0am')
        })

        it('queryNightFavorite returns artist with most night streams', async () => {
            const result = await conn.runAndReadAll(queryNightFavorite())
            const rows = result.getRowObjectsJson()
            expect(rows.length).toBe(1)
            const row = rows[0]
            expect(row.factType).toBe('night_favorite')
            expect(row.mainText).toBe('top_night_artist')
            expect(row.value).toBe('2')
            expect(row.unit).toBe('streams')
            expect(row.context).toBe('between 0am and 6am')
        })
    })

    describe('Marathon queries', () => {
        const testData: TestStreamEntry[] = [
            {
                ts: '2024-01-01',
                master_metadata_album_artist_name: 'consecutive_stream_artist',
            },
            {
                ts: '2024-01-02',
                master_metadata_album_artist_name: 'consecutive_stream_artist',
            },
            {
                ts: '2024-01-03',
                master_metadata_album_artist_name: 'consecutive_stream_artist',
            },
            {
                ts: '2024-01-04',
                master_metadata_album_artist_name: 'middle_stream_artist',
            },
            {
                ts: '2024-01-05',
                master_metadata_album_artist_name: 'consecutive_stream_artist',
            },
        ]

        beforeEach(async () => {
            await createTestTable(conn, testData)
        })

        it('queryMarathon returns longest consecutive artist stream', async () => {
            const rows = await testQuery(conn, queryMarathon())
            expect(rows.length).toBe(1)
            const row = rows[0]
            expect(row.factType).toBe('marathon')
            expect(row.mainText).toBe('consecutive_stream_artist')
            expect(row.value).toBe(3)
            expect(row.unit).toBe('streams in a row')
            expect(row.context).toBe('on 2024-01-01')
        })
    })

    describe('One hit wonder queries', () => {
        const testData: TestStreamEntry[] = [
            {
                master_metadata_album_artist_name: 'one_hit_wonder_artist',
                master_metadata_track_name: 'hit_track',
            },
        ]

        beforeEach(async () => {
            await createTestTable(conn, testData)
        })

        it('queryOneHitWonder returns track with highest percentage of artist streams', async () => {
            const rows = await testQuery(conn, queryOneHitWonder())
            expect(rows.length).toBe(1)
            const row = rows[0]
            expect(row.factType).toBe('one_hit_wonder')
            expect(row.mainText).toBe('hit_track')
            expect(row.value).toBe(100)
            expect(row.unit).toBe('%')
            expect(row.context).toBe(
                'of total streams of one_hit_wonder_artist'
            )
        })
    })

    describe('Weekend favorite queries', () => {
        const testData: TestStreamEntry[] = [
            // Week
            {
                ts: '2025-12-01',
                master_metadata_album_artist_name: 'week_artist',
            },
            {
                ts: '2025-12-02',
                master_metadata_album_artist_name: 'week_artist',
            },
            {
                ts: '2025-12-03',
                master_metadata_album_artist_name: 'weekend_artist',
            },
            // Week-end
            {
                ts: '2025-12-07',
                master_metadata_album_artist_name: 'week_artist',
            },
            {
                ts: '2025-12-07',
                master_metadata_album_artist_name: 'weekend_artist',
            },
            {
                ts: '2025-12-07',
                master_metadata_album_artist_name: 'weekend_artist',
            },
        ]

        beforeEach(async () => {
            await createTestTable(conn, testData)
        })

        it('queryWeekendFavorite returns artist with most weekend streams', async () => {
            const rows = await testQuery(conn, queryWeekendFavorite())
            expect(rows.length).toBe(1)
            const row = rows[0]
            expect(row.factType).toBe('weekend_favorite')
            expect(row.mainText).toBe('weekend_artist')
            expect(row.value).toBe('2')
            expect(row.unit).toBe('streams')
            expect(row.context).toBe('during the weekend')
        })
    })

    describe('Absolute loyalty queries', () => {
        const testData: TestStreamEntry[] = [
            {
                master_metadata_album_artist_name: 'loyal_artist',
                reason_end: 'trackdone',
            },
            {
                master_metadata_album_artist_name: 'loyal_artist',
                reason_end: 'trackdone',
            },
            {
                master_metadata_album_artist_name: 'loyal_artist',
                reason_end: 'trackdone',
            },
            {
                master_metadata_album_artist_name: 'loyal_artist',
                reason_end: 'clickrow',
            },
            {
                master_metadata_album_artist_name: 'artist1',
                reason_end: 'fwdbtn',
            },
            {
                master_metadata_album_artist_name: 'artist1',
                reason_end: 'trackdone',
            },
            {
                master_metadata_album_artist_name: 'artist1',
                reason_end: 'trackdone',
            },
            {
                master_metadata_album_artist_name: 'artist1',
                reason_end: 'clickrow',
            },
        ]

        beforeEach(async () => {
            await createTestTable(conn, testData)
        })

        it('queryAbsoluteLoyalty returns artist with highest listening time percentage', async () => {
            const rows = await testQuery(conn, queryAbsoluteLoyalty())
            expect(rows.length).toBe(1)
            const row = rows[0]
            expect(row.factType).toBe('absolute_loyalty')
            expect(row.mainText).toBe('loyal_artist')
            expect(row.value).toBe(75)
            expect(row.unit).toBe('%')
            expect(row.context).toBe('of your completed (3) vs skipped (1)')
        })
    })

    describe('Nostalgic return queries', () => {
        const testData: TestStreamEntry[] = [
            {
                ts: '2024-01-01',
                master_metadata_album_artist_name: 'nostalgic_artist',
            },
            {
                ts: '2024-01-01',
                master_metadata_album_artist_name: 'nostalgic_artist',
            },
            {
                ts: '2025-01-01',
                master_metadata_album_artist_name: 'nostalgic_artist',
            },
            {
                ts: '2025-01-01',
                master_metadata_album_artist_name: 'artist1',
            },
            {
                ts: '2025-01-01',
                master_metadata_album_artist_name: 'artist2',
            },
        ]

        beforeEach(async () => {
            await createTestTable(conn, testData)
        })

        it('queryNostalgicReturn returns recently played artist with longest gap', async () => {
            const rows = await testQuery(conn, queryNostalgicReturn())
            expect(rows.length).toBe(1)
            const row = rows[0]
            expect(row.factType).toBe('nostalgic_return')
            expect(row.mainText).toBe('nostalgic_artist')
            expect(row.value).toBe(366)
            expect(row.unit).toBe('days')
            expect(row.context).toBe(
                'days since last listen (2024-01-01 - 2025-01-01)'
            )
        })
    })

    describe('Variety day queries', () => {
        const testData: TestStreamEntry[] = [
            // One day
            { ts: '2024-01-01', master_metadata_album_artist_name: 'artist1' },
            { ts: '2024-01-01', master_metadata_album_artist_name: 'artist2' },
            { ts: '2024-01-01', master_metadata_album_artist_name: 'artist3' },
            // Another day
            { ts: '2024-01-02', master_metadata_album_artist_name: 'artist1' },
        ]

        beforeEach(async () => {
            await createTestTable(conn, testData)
        })

        it('queryVarietyDay returns day with most distinct artists', async () => {
            const rows = await testQuery(conn, queryVarietyDay())
            expect(rows.length).toBe(1)
            const row = rows[0]
            expect(row.factType).toBe('variety_day')
            expect(row.mainText).toBe('2024-01-01')
            expect(row.value).toBe(3)
            expect(row.unit).toBe('different artists')
            expect(row.context).toBe('record of diversity in one day')
        })
    })

    describe('Binge listener queries', () => {
        const testData: TestStreamEntry[] = [
            { ts: '2024-01-01', ms_played: 10000 },
            { ts: '2024-01-02', ms_played: 200000 },
            { ts: '2024-01-03', ms_played: 3600000 },
        ]

        beforeEach(async () => {
            await createTestTable(conn, testData)
        })

        it('queryBingeListener returns day with most listening time', async () => {
            const rows = await testQuery(conn, queryBingeListener())
            expect(rows.length).toBe(1)
            const row = rows[0]
            expect(row.factType).toBe('binge_listener')
            expect(row.mainText).toBe('2024-01-03')
            expect(row.value).toBe(1)
            expect(row.unit).toBe('hours of listening')
            expect(row.context).toBe('your record of listening time in one day')
        })
    })

    describe('Current obsession queries', () => {
        const testData: TestStreamEntry[] = [
            // Recent streams
            {
                ts: '2025-01-01',
                master_metadata_album_artist_name: 'artist1',
                master_metadata_track_name: 'current_hit',
            },
            {
                ts: '2025-01-01',
                master_metadata_album_artist_name: 'artist1',
                master_metadata_track_name: 'current_hit',
            },
            {
                ts: '2025-01-01',
                master_metadata_album_artist_name: 'artist1',
                master_metadata_track_name: 'track1',
            },
            // Old streams
            {
                ts: '2024-01-01',
                master_metadata_album_artist_name: 'artist1',
                master_metadata_track_name: 'track1',
            },
            {
                ts: '2024-01-01',
                master_metadata_album_artist_name: 'artist1',
                master_metadata_track_name: 'track1',
            },
            {
                ts: '2024-01-01',
                master_metadata_album_artist_name: 'artist1',
                master_metadata_track_name: 'current_hit',
            },
        ]

        beforeEach(async () => {
            await createTestTable(conn, testData)
        })

        it('queryCurrentObsession returns most played track in last 30 days', async () => {
            const rows = await testQuery(conn, queryCurrentObsession())
            expect(rows.length).toBe(1)
            const row = rows[0]
            expect(row.factType).toBe('current_obsession')
            expect(row.mainText).toBe('current_hit')
            expect(row.value).toBe(2)
            expect(row.unit).toBe('streams')
            expect(row.context).toBe('in the last 30 days')
        })
    })

    describe('Recent discovery queries', () => {
        const testData: TestStreamEntry[] = [
            // Recent streams
            {
                ts: '2025-01-01',
                master_metadata_album_artist_name: 'recent_discovery_artist',
            },
            {
                ts: '2025-01-01',
                master_metadata_album_artist_name: 'already_discovered_artist',
            },
            {
                ts: '2025-01-01',
                master_metadata_album_artist_name: 'already_discovered_artist',
            },
            // Old streams
            {
                ts: '2024-01-01',
                master_metadata_album_artist_name: 'already_discovered_artist',
            },
        ]

        beforeEach(async () => {
            await createTestTable(conn, testData)
        })

        it('queryRecentDiscovery returns recently discovered artist with most streams', async () => {
            const rows = await testQuery(conn, queryRecentDiscovery())
            expect(rows.length).toBe(1)
            const row = rows[0]
            expect(row.factType).toBe('recent_discovery')
            expect(row.mainText).toBe('recent_discovery_artist')
            expect(row.value).toBe(1)
            expect(row.unit).toBe('streams')
            expect(row.context).toBe('discovered during the last 3 months')
        })
    })

    describe('Peak hour queries', () => {
        const testData: TestStreamEntry[] = [
            { ts: '2024-01-01T10:00:00' },
            { ts: '2024-01-02T10:00:00' },
            { ts: '2024-01-03T12:00:00' },
            { ts: '2024-01-04T13:00:00' },
            { ts: '2024-01-05T14:00:00' },
        ]

        beforeEach(async () => {
            await createTestTable(conn, testData)
        })

        it('queryPeakHour returns hour with most streams', async () => {
            const rows = await testQuery(conn, queryPeakHour())
            expect(rows.length).toBe(1)
            const row = rows[0]
            expect(row.factType).toBe('peak_hour')
            expect(row.mainText).toBe('10h')
            expect(row.value).toBe(40)
            expect(row.unit).toBe('%')
            expect(row.context).toBe('of total streams')
        })
    })

    describe('Subscribed artist queries', () => {
        const testData: TestStreamEntry[] = [
            {
                ts: '2024-01-01',
                master_metadata_album_artist_name: 'subscribed_artist',
            },
            {
                ts: '2024-02-01',
                master_metadata_album_artist_name: 'subscribed_artist',
            },
            {
                ts: '2024-03-01',
                master_metadata_album_artist_name: 'subscribed_artist',
            },
            { ts: '2024-04-01', master_metadata_album_artist_name: 'artist1' },
            { ts: '2024-05-01', master_metadata_album_artist_name: 'artist1' },
            { ts: '2024-05-02', master_metadata_album_artist_name: 'artist1' },
            { ts: '2024-05-03', master_metadata_album_artist_name: 'artist1' },
        ]

        beforeEach(async () => {
            await createTestTable(conn, testData)
        })

        it('querySubscribedArtist returns artist present in most months', async () => {
            const rows = await testQuery(conn, querySubscribedArtist())
            expect(rows.length).toBe(1)
            const row = rows[0]
            expect(row.factType).toBe('subscribed_artist')
            expect(row.mainText).toBe('subscribed_artist')
            expect(row.value).toBe(3)
            expect(row.unit).toBe('months')
            expect(row.context).toBe('of presence')
        })
    })

    describe('Old artist queries', () => {
        const testData: TestStreamEntry[] = [
            {
                ts: '2006-01-01',
                master_metadata_album_artist_name: 'first_artist',
            },
            {
                ts: '2008-01-01',
                master_metadata_album_artist_name: 'second_artist',
            },
            {
                ts: '2018-01-01',
                master_metadata_album_artist_name: 'second_artist',
            },
            {
                ts: '2024-01-01',
                master_metadata_album_artist_name: 'first_artist',
            },
        ]

        beforeEach(async () => {
            await createTestTable(conn, testData)
        })

        it('queryFirstArtist returns first artist listened to', async () => {
            const rows = await testQuery(conn, queryFirstArtist())
            expect(rows.length).toBe(1)
            const row = rows[0]
            expect(row.factType).toBe('first_artist')
            expect(row.mainText).toBe('first_artist')
            expect(row.value).toBe('2006')
            expect(row.unit).toBeUndefined()
            expect(row.context).toBe('Do you still listen to it?')
        })

        it('queryMusicalAnniversary returns artist listened to for longest time', async () => {
            const rows = await testQuery(conn, queryMusicalAnniversary())
            expect(rows.length).toBe(1)
            const row = rows[0]
            expect(row.factType).toBe('musical_anniversary')
            expect(row.mainText).toBeDefined()
            expect(row.value).toBeDefined()
            expect(row.unit).toBe('years')
            expect(row.context).toBe('with you')
        })
    })

    describe('Unbeatable streak queries', () => {
        const testData: TestStreamEntry[] = [
            { ts: '2024-01-01' },
            // Start streak
            { ts: '2024-01-03' },
            { ts: '2024-01-04' },
            { ts: '2024-01-04' },
            { ts: '2024-01-05' },
            // End streak
            { ts: '2024-01-07' },
        ]

        beforeEach(async () => {
            await createTestTable(conn, testData)
        })

        it('queryUnbeatableStreak returns longest consecutive listening days', async () => {
            const rows = await testQuery(conn, queryUnbeatableStreak())
            expect(rows.length).toBe(1)
            const row = rows[0]
            expect(row.factType).toBe('unbeatable_streak')
            expect(row.mainText).toBe('2024-01-03 - 2024-01-05')
            expect(row.value).toBe(3)
            expect(row.unit).toBe('days in a row')
            expect(row.context).toBe('your longest streak')
        })
    })

    describe('Forgotten artist queries', () => {
        const testData: TestStreamEntry[] = [
            // Old streams
            {
                ts: '2024-01-01',
                master_metadata_album_artist_name: 'forgotten_artist',
            },
            {
                ts: '2024-01-01',
                master_metadata_album_artist_name: 'old_artist',
            },
            // Recent streams
            {
                ts: '2025-01-01',
                master_metadata_album_artist_name: 'old_artist',
            },
            {
                ts: '2025-01-01',
                master_metadata_album_artist_name: 'new_artist',
            },
            {
                ts: '2025-01-01',
                master_metadata_album_artist_name: 'new_artist',
            },
        ]

        beforeEach(async () => {
            await createTestTable(conn, testData)
        })

        it('queryForgottenArtist returns top artist not listened to recently', async () => {
            const rows = await testQuery(conn, queryForgottenArtist())
            expect(rows.length).toBe(1)
            const row = rows[0]
            expect(row.factType).toBe('forgotten_artist')
            expect(row.mainText).toBe('forgotten_artist')
            expect(row.value).toBe(366)
            expect(row.unit).toBe('days')
            expect(row.context).toBe(
                'without listening to artist with more than 1 streams'
            )
        })
    })

    describe('Track proposition queries', () => {
        const testData: TestStreamEntry[] = [
            {
                master_metadata_album_artist_name: 'artist1',
                master_metadata_track_name: 'track1',
            },
            {
                master_metadata_album_artist_name: 'artist2',
                master_metadata_track_name: 'track2',
            },
        ]

        beforeEach(async () => {
            await createTestTable(conn, testData)
        })

        it('queryTrackProposition returns a random track', async () => {
            const rows = await testQuery(conn, queryTrackProposition())
            expect(rows.length).toBe(1)
            const row = rows[0]
            expect(row.factType).toBe('track_proposition')
            expect(row.mainText).toBeOneOf(['track1', 'track2'])
            expect(row.value).toBeOneOf(['by artist1', 'by artist2'])
            expect(row.unit).toBeUndefined()
            expect(row.context).toBeUndefined()
        })
    })
})
