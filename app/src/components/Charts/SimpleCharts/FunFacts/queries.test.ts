import { afterAll, beforeAll, beforeEach, describe, it, expect } from 'vitest'
import { facts } from './queries'
import {
    createTestConnection,
    closeTestConnection,
    testQuery,
    createTestTable,
    type TestStreamEntry,
} from '../__tests__/test-utils'
import type { DuckDBConnection } from '@duckdb/node-api'

let conn: DuckDBConnection

const getFact = (fact_type: string) =>
    facts.find((f) => f.fact_type === fact_type)!

describe('FunFacts queries', () => {
    beforeAll(async () => {
        conn = await createTestConnection()
    })

    afterAll(() => {
        closeTestConnection(conn)
    })

    it('all fact definitions expose build sql', () => {
        facts.forEach((fact) => {
            expect(fact.fact_type).toBeTruthy()
            expect(fact.title).toBeTruthy()
            expect(fact.emoji).toBeTruthy()
            expect(fact.sql).toBeTruthy()
            expect(fact.sql).not.toContain('$')
            expect(fact.sql).not.toContain('{')
            expect(fact.sql).not.toContain('}')
        })
    })

    describe('Favorite artist queries', () => {
        const testData: TestStreamEntry[] = [
            { ts: '2024-02-07T06:00:00', artist_name: 'top_morning_artist' },
            { ts: '2024-02-07T07:00:00', artist_name: 'top_morning_artist' },
            { ts: '2024-02-07T08:00:00', artist_name: 'morning_artist' },
            { ts: '2024-02-07T12:00:00', artist_name: 'top_afternoon_artist' },
            { ts: '2024-02-07T13:00:00', artist_name: 'afternoon_artist' },
            { ts: '2024-02-07T14:00:00', artist_name: 'top_afternoon_artist' },
            { ts: '2024-02-07T18:00:00', artist_name: 'evening_artist' },
            { ts: '2024-02-07T19:00:00', artist_name: 'top_evening_artist' },
            { ts: '2024-02-07T20:00:00', artist_name: 'top_evening_artist' },
            { ts: '2024-02-07T00:00:00', artist_name: 'top_night_artist' },
            { ts: '2024-02-07T01:00:00', artist_name: 'night_artist' },
            { ts: '2024-02-07T02:00:00', artist_name: 'top_night_artist' },
        ]

        beforeEach(async () => {
            await createTestTable(conn, testData)
        })

        it('queryMorningFavorite returns artist with most morning streams', async () => {
            const rows = await testQuery(conn, getFact('morning_favorite').sql)
            expect(rows.length).toBe(1)
            const row = rows[0]
            expect(row.fact_type).toBe('morning_favorite')
            expect(row.main_text).toBe('top_morning_artist')
            expect(row.fact_value).toBe('2')
            expect(row.unit).toBe('streams')
            expect(row.context).toBe('between 6am and 12pm')
        })

        it('queryAfternoonFavorite returns artist with most afternoon streams', async () => {
            const rows = await testQuery(
                conn,
                getFact('afternoon_favorite').sql
            )
            expect(rows.length).toBe(1)
            const row = rows[0]
            expect(row.fact_type).toBe('afternoon_favorite')
            expect(row.main_text).toBe('top_afternoon_artist')
            expect(row.fact_value).toBe('2')
            expect(row.unit).toBe('streams')
            expect(row.context).toBe('between 12pm and 6pm')
        })

        it('queryEveningFavorite returns artist with most evening streams', async () => {
            const result = await conn.runAndReadAll(
                getFact('evening_favorite').sql
            )
            const rows = result.getRowObjectsJson()
            expect(rows.length).toBe(1)
            const row = rows[0]
            expect(row.fact_type).toBe('evening_favorite')
            expect(row.main_text).toBe('top_evening_artist')
            expect(row.fact_value).toBe('2')
            expect(row.unit).toBe('streams')
            expect(row.context).toBe('between 6pm and 0am')
        })

        it('queryNightFavorite returns artist with most night streams', async () => {
            const result = await conn.runAndReadAll(
                getFact('night_favorite').sql
            )
            const rows = result.getRowObjectsJson()
            expect(rows.length).toBe(1)
            const row = rows[0]
            expect(row.fact_type).toBe('night_favorite')
            expect(row.main_text).toBe('top_night_artist')
            expect(row.fact_value).toBe('2')
            expect(row.unit).toBe('streams')
            expect(row.context).toBe('between 0am and 6am')
        })
    })

    describe('Marathon queries', () => {
        const testData: TestStreamEntry[] = [
            { ts: '2024-01-01', artist_name: 'consecutive_stream_artist' },
            { ts: '2024-01-02', artist_name: 'consecutive_stream_artist' },
            { ts: '2024-01-03', artist_name: 'consecutive_stream_artist' },
            { ts: '2024-01-04', artist_name: 'middle_stream_artist' },
            { ts: '2024-01-05', artist_name: 'consecutive_stream_artist' },
        ]

        beforeEach(async () => {
            await createTestTable(conn, testData)
        })

        it('queryMarathon returns longest consecutive artist stream', async () => {
            const rows = await testQuery(conn, getFact('marathon').sql)
            expect(rows.length).toBe(1)
            const row = rows[0]
            expect(row.fact_type).toBe('marathon')
            expect(row.main_text).toBe('consecutive_stream_artist')
            expect(row.fact_value).toBe(3)
            expect(row.unit).toBe('streams in a row')
            expect(row.context).toBe('on 2024-01-01')
        })
    })

    describe('One hit wonder queries', () => {
        const testData: TestStreamEntry[] = [
            { artist_name: 'one_hit_wonder_artist', track_name: 'hit_track' },
        ]

        beforeEach(async () => {
            await createTestTable(conn, testData)
        })

        it('queryOneHitWonder returns track with highest percentage of artist streams', async () => {
            const rows = await testQuery(conn, getFact('one_hit_wonder').sql)
            expect(rows.length).toBe(1)
            const row = rows[0]
            expect(row.fact_type).toBe('one_hit_wonder')
            expect(row.main_text).toBe('hit_track')
            expect(row.fact_value).toBe(100)
            expect(row.unit).toBe('%')
            expect(row.context).toBe(
                'of total streams of one_hit_wonder_artist'
            )
        })
    })

    describe('Weekend favorite queries', () => {
        const testData: TestStreamEntry[] = [
            // Week
            { ts: '2025-12-01', artist_name: 'week_artist' },
            { ts: '2025-12-02', artist_name: 'week_artist' },
            { ts: '2025-12-03', artist_name: 'weekend_artist' },
            // Weekend
            { ts: '2025-12-07', artist_name: 'week_artist' },
            { ts: '2025-12-07', artist_name: 'weekend_artist' },
            { ts: '2025-12-07', artist_name: 'weekend_artist' },
        ]

        beforeEach(async () => {
            await createTestTable(conn, testData)
        })

        it('queryWeekendFavorite returns artist with most weekend streams', async () => {
            const rows = await testQuery(conn, getFact('weekend_favorite').sql)
            expect(rows.length).toBe(1)
            const row = rows[0]
            expect(row.fact_type).toBe('weekend_favorite')
            expect(row.main_text).toBe('weekend_artist')
            expect(row.fact_value).toBe('2')
            expect(row.unit).toBe('streams')
            expect(row.context).toBe('during the weekend')
        })
    })

    describe('Absolute loyalty queries', () => {
        const testData: TestStreamEntry[] = [
            { artist_name: 'loyal_artist', reason_end: 'trackdone' },
            { artist_name: 'loyal_artist', reason_end: 'trackdone' },
            { artist_name: 'loyal_artist', reason_end: 'trackdone' },
            { artist_name: 'loyal_artist', reason_end: 'clickrow' },
            { artist_name: 'artist1', reason_end: 'fwdbtn' },
            { artist_name: 'artist1', reason_end: 'trackdone' },
            { artist_name: 'artist1', reason_end: 'trackdone' },
            { artist_name: 'artist1', reason_end: 'clickrow' },
        ]

        beforeEach(async () => {
            await createTestTable(conn, testData)
        })

        it('queryAbsoluteLoyalty returns artist with highest listening time percentage', async () => {
            const rows = await testQuery(conn, getFact('absolute_loyalty').sql)
            expect(rows.length).toBe(1)
            const row = rows[0]
            expect(row.fact_type).toBe('absolute_loyalty')
            expect(row.main_text).toBe('loyal_artist')
            expect(row.fact_value).toBe(75)
            expect(row.unit).toBe('%')
            expect(row.context).toBe('of your completed (3) vs skipped (1)')
        })
    })

    describe('Nostalgic return queries', () => {
        const testData: TestStreamEntry[] = [
            { ts: '2024-01-01', artist_name: 'nostalgic_artist' },
            { ts: '2024-01-01', artist_name: 'nostalgic_artist' },
            { ts: '2025-01-01', artist_name: 'nostalgic_artist' },
            { ts: '2025-01-01', artist_name: 'artist1' },
            { ts: '2025-01-01', artist_name: 'artist2' },
        ]

        beforeEach(async () => {
            await createTestTable(conn, testData)
        })

        it('queryNostalgicReturn returns recently played artist with longest gap', async () => {
            const rows = await testQuery(conn, getFact('nostalgic_return').sql)
            expect(rows.length).toBe(1)
            const row = rows[0]
            expect(row.fact_type).toBe('nostalgic_return')
            expect(row.main_text).toBe('nostalgic_artist')
            expect(row.fact_value).toBe(366)
            expect(row.unit).toBe('days')
            expect(row.context).toBe(
                'days since last listen (2024-01-01 - 2025-01-01)'
            )
        })
    })

    describe('Variety day queries', () => {
        const testData: TestStreamEntry[] = [
            // One day
            { ts: '2024-01-01', artist_name: 'artist1' },
            { ts: '2024-01-01', artist_name: 'artist2' },
            { ts: '2024-01-01', artist_name: 'artist3' },
            // Another day
            { ts: '2024-01-02', artist_name: 'artist1' },
        ]

        beforeEach(async () => {
            await createTestTable(conn, testData)
        })

        it('queryVarietyDay returns day with most distinct artists', async () => {
            const rows = await testQuery(conn, getFact('variety_day').sql)
            expect(rows.length).toBe(1)
            const row = rows[0]
            expect(row.fact_type).toBe('variety_day')
            expect(row.main_text).toBe('2024-01-01')
            expect(row.fact_value).toBe(3)
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
            const rows = await testQuery(conn, getFact('binge_listener').sql)
            expect(rows.length).toBe(1)
            const row = rows[0]
            expect(row.fact_type).toBe('binge_listener')
            expect(row.main_text).toBe('2024-01-03')
            expect(row.fact_value).toBe(1)
            expect(row.unit).toBe('hours of listening')
            expect(row.context).toBe('your record of listening time in one day')
        })
    })

    describe('Current obsession queries', () => {
        // prettier-ignore
        const testData: TestStreamEntry[] = [
            // Recent streams
            { ts: '2025-01-01', artist_name: 'artist1', track_name: 'current_hit' },
            { ts: '2025-01-01', artist_name: 'artist1', track_name: 'current_hit' },
            { ts: '2025-01-01', artist_name: 'artist1', track_name: 'track1' },
            // Old streams
            { ts: '2024-01-01', artist_name: 'artist1', track_name: 'track1' },
            { ts: '2024-01-01', artist_name: 'artist1', track_name: 'track1' },
            { ts: '2024-01-01', artist_name: 'artist1', track_name: 'current_hit' },
        ]

        beforeEach(async () => {
            await createTestTable(conn, testData)
        })

        it('queryCurrentObsession returns most played track in last 30 days', async () => {
            const rows = await testQuery(conn, getFact('current_obsession').sql)
            expect(rows.length).toBe(1)
            const row = rows[0]
            expect(row.fact_type).toBe('current_obsession')
            expect(row.main_text).toBe('current_hit')
            expect(row.fact_value).toBe(2)
            expect(row.unit).toBe('streams')
            expect(row.context).toBe('in the last 30 days')
        })
    })

    describe('Recent discovery queries', () => {
        const testData: TestStreamEntry[] = [
            // Recent streams
            { ts: '2025-01-01', artist_name: 'recent_discovery_artist' },
            { ts: '2025-01-01', artist_name: 'already_discovered_artist' },
            { ts: '2025-01-01', artist_name: 'already_discovered_artist' },
            // Old streams
            { ts: '2024-01-01', artist_name: 'already_discovered_artist' },
        ]

        beforeEach(async () => {
            await createTestTable(conn, testData)
        })

        it('queryRecentDiscovery returns recently discovered artist with most streams', async () => {
            const rows = await testQuery(conn, getFact('recent_discovery').sql)
            expect(rows.length).toBe(1)
            const row = rows[0]
            expect(row.fact_type).toBe('recent_discovery')
            expect(row.main_text).toBe('recent_discovery_artist')
            expect(row.fact_value).toBe(1)
            expect(row.unit).toBe('streams')
            expect(row.context).toBe('discovered during the last 3 months')
        })
    })

    describe('Subscribed artist queries', () => {
        const testData: TestStreamEntry[] = [
            { ts: '2024-01-01', artist_name: 'subscribed_artist' },
            { ts: '2024-02-01', artist_name: 'subscribed_artist' },
            { ts: '2024-03-01', artist_name: 'subscribed_artist' },
            { ts: '2024-04-01', artist_name: 'artist1' },
            { ts: '2024-05-01', artist_name: 'artist1' },
            { ts: '2024-05-02', artist_name: 'artist1' },
            { ts: '2024-05-03', artist_name: 'artist1' },
        ]

        beforeEach(async () => {
            await createTestTable(conn, testData)
        })

        it('querySubscribedArtist returns artist present in most months', async () => {
            const rows = await testQuery(conn, getFact('subscribed_artist').sql)
            expect(rows.length).toBe(1)
            const row = rows[0]
            expect(row.fact_type).toBe('subscribed_artist')
            expect(row.main_text).toBe('subscribed_artist')
            expect(row.fact_value).toBe(3)
            expect(row.unit).toBe('months')
            expect(row.context).toBe('of presence')
        })
    })

    describe('Old artist queries', () => {
        const testData: TestStreamEntry[] = [
            { ts: '2006-01-01', artist_name: 'first_artist' },
            { ts: '2008-01-01', artist_name: 'second_artist' },
            { ts: '2018-01-01', artist_name: 'second_artist' },
            { ts: '2024-01-01', artist_name: 'first_artist' },
        ]

        beforeEach(async () => {
            await createTestTable(conn, testData)
        })

        it('queryFirstArtist returns first artist listened to', async () => {
            const rows = await testQuery(conn, getFact('first_artist').sql)
            expect(rows.length).toBe(1)
            const row = rows[0]
            expect(row.fact_type).toBe('first_artist')
            expect(row.main_text).toBe('first_artist')
            expect(row.fact_value).toBe('2006')
            expect(row.unit).toBeUndefined()
            expect(row.context).toBe('Do you still listen to it?')
        })

        it('queryMusicalAnniversary returns artist listened to for longest time', async () => {
            const rows = await testQuery(
                conn,
                getFact('musical_anniversary').sql
            )
            expect(rows.length).toBe(1)
            const row = rows[0]
            expect(row.fact_type).toBe('musical_anniversary')
            expect(row.main_text).toBeDefined()
            expect(row.fact_value).toBeDefined()
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
            const rows = await testQuery(conn, getFact('unbeatable_streak').sql)
            expect(rows.length).toBe(1)
            const row = rows[0]
            expect(row.fact_type).toBe('unbeatable_streak')
            expect(row.main_text).toBe('2024-01-03 - 2024-01-05')
            expect(row.fact_value).toBe(3)
            expect(row.unit).toBe('days in a row')
            expect(row.context).toBe('your longest streak')
        })
    })

    describe('Forgotten artist queries', () => {
        const testData: TestStreamEntry[] = [
            // Old streams
            { ts: '2024-01-01', artist_name: 'forgotten_artist' },
            { ts: '2024-01-01', artist_name: 'old_artist' },
            // Recent streams
            { ts: '2025-01-01', artist_name: 'old_artist' },
            { ts: '2025-01-01', artist_name: 'new_artist' },
            { ts: '2025-01-01', artist_name: 'new_artist' },
        ]

        beforeEach(async () => {
            await createTestTable(conn, testData)
        })

        it('queryForgottenArtist returns top artist not listened to recently', async () => {
            const rows = await testQuery(conn, getFact('forgotten_artist').sql)
            expect(rows.length).toBe(1)
            const row = rows[0]
            expect(row.fact_type).toBe('forgotten_artist')
            expect(row.main_text).toBe('forgotten_artist')
            expect(row.fact_value).toBe(366)
            expect(row.unit).toBe('days')
            expect(row.context).toBe(
                'without listening to artist with more than 1 streams'
            )
        })
    })

    describe('Track proposition queries', () => {
        const testData: TestStreamEntry[] = [
            { artist_name: 'artist1', track_name: 'track1' },
            { artist_name: 'artist2', track_name: 'track2' },
        ]

        beforeEach(async () => {
            await createTestTable(conn, testData)
        })

        it('queryTrackProposition returns a random track', async () => {
            const rows = await testQuery(conn, getFact('track_proposition').sql)
            expect(rows.length).toBe(1)
            const row = rows[0]
            expect(row.fact_type).toBe('track_proposition')
            expect(row.main_text).toBeOneOf(['track1', 'track2'])
            expect(row.fact_value).toBeOneOf(['by artist1', 'by artist2'])
            expect(row.unit).toBeUndefined()
            expect(row.context).toBeUndefined()
        })
    })

    describe('queryCozyAlbum', () => {
        // 2025-03-30 is a Sunday, 2025-03-31 is a Monday.
        // 2023-03-26 is a Sunday, >1 year before RECENT_SUNDAY (window boundary check).
        const RECENT_SUNDAY = '2025-03-30T15:00:00'
        const RECENT_MON_2AM = '2025-03-31T02:00:00'
        const RECENT_MON_3AM = '2025-03-31T03:00:00'
        const RECENT_MON_6AM = '2025-03-31T06:00:00'
        const OLD_SUNDAY = '2023-03-26T15:00:00'

        describe('FunFactResult content', () => {
            // prettier-ignore
            const testData: TestStreamEntry[] = [
                { artist_name: 'artist1', track_name: 'track1', album_name: 'album1', ts: RECENT_SUNDAY },
                { artist_name: 'artist1', track_name: 'track2', album_name: 'album1', ts: RECENT_SUNDAY },
                { artist_name: 'artist1', track_name: 'track3', album_name: 'album1', ts: RECENT_SUNDAY },
                { artist_name: 'artist1', track_name: 'track4', album_name: 'album1', ts: RECENT_SUNDAY },
                { artist_name: 'artist1', track_name: 'track5', album_name: 'album1', ts: RECENT_SUNDAY },
                { artist_name: 'artist1', track_name: 'track6', album_name: 'album1', ts: RECENT_SUNDAY },
                { artist_name: 'artist1', track_name: 'track7', album_name: 'album1', ts: RECENT_SUNDAY },
            ]

            it('contains album and artist names', async () => {
                await createTestTable(conn, testData)

                const rows = await testQuery(conn, getFact('cozy_album').sql)
                expect(rows.length).toBe(1)
                expect(rows[0].fact_type).toBe('cozy_album')
                expect(rows[0].main_text).toBe('album1')
                expect(rows[0].second_text).toBe('artist1')
                expect(rows[0].fact_value).toBeUndefined()
                expect(rows[0].unit).toBeUndefined()
                expect(rows[0].context).toBe(
                    'the album that wraps your Sundays in musical coziness'
                )
            })
        })

        describe('sunday filtering rule', () => {
            // prettier-ignore
            const testData: TestStreamEntry[] = [
                // album1 -> 7 distinct tracks on valid Sunday window (should win)
                { artist_name: 'artist1', album_name: 'album1', track_name: 't1', ts: RECENT_SUNDAY },
                { artist_name: 'artist1', album_name: 'album1', track_name: 't2', ts: RECENT_SUNDAY },
                { artist_name: 'artist1', album_name: 'album1', track_name: 't3', ts: RECENT_SUNDAY },
                { artist_name: 'artist1', album_name: 'album1', track_name: 't4', ts: RECENT_SUNDAY },
                { artist_name: 'artist1', album_name: 'album1', track_name: 't5', ts: RECENT_MON_2AM },
                { artist_name: 'artist1', album_name: 'album1', track_name: 't6', ts: RECENT_MON_3AM },
                { artist_name: 'artist1', album_name: 'album1', track_name: 't7', ts: RECENT_SUNDAY },
                // album2 -> 8 distinct tracks but Monday 6am (invalid)
                { artist_name: 'artist2', album_name: 'album2', track_name: 'a1', ts: RECENT_MON_6AM },
                { artist_name: 'artist2', album_name: 'album2', track_name: 'a2', ts: RECENT_MON_6AM },
                { artist_name: 'artist2', album_name: 'album2', track_name: 'a3', ts: RECENT_MON_6AM },
                { artist_name: 'artist2', album_name: 'album2', track_name: 'a4', ts: RECENT_MON_6AM },
                { artist_name: 'artist2', album_name: 'album2', track_name: 'a5', ts: RECENT_MON_6AM },
                { artist_name: 'artist2', album_name: 'album2', track_name: 'a6', ts: RECENT_MON_6AM },
                { artist_name: 'artist2', album_name: 'album2', track_name: 'a7', ts: RECENT_MON_6AM },
                { artist_name: 'artist2', album_name: 'album2', track_name: 'a8', ts: RECENT_MON_6AM },
            ]

            it('includes Sunday and Monday before 4am only', async () => {
                await createTestTable(conn, testData)
                const rows = await testQuery(conn, getFact('cozy_album').sql)
                expect(rows.length).toBe(1)
                expect(rows[0].main_text).toBe('album1')
            })
        })

        describe('time window rule (last year only)', () => {
            // prettier-ignore
            const testData: TestStreamEntry[] = [
                // album1 -> 8 distinct tracks BUT 2 years ago
                { artist_name: 'artist1', album_name: 'album1', track_name: 't1', ts: OLD_SUNDAY },
                { artist_name: 'artist1', album_name: 'album1', track_name: 't2', ts: OLD_SUNDAY },
                { artist_name: 'artist1', album_name: 'album1', track_name: 't3', ts: OLD_SUNDAY },
                { artist_name: 'artist1', album_name: 'album1', track_name: 't4', ts: OLD_SUNDAY },
                { artist_name: 'artist1', album_name: 'album1', track_name: 't5', ts: OLD_SUNDAY },
                { artist_name: 'artist1', album_name: 'album1', track_name: 't6', ts: OLD_SUNDAY },
                { artist_name: 'artist1', album_name: 'album1', track_name: 't7', ts: OLD_SUNDAY },
                { artist_name: 'artist1', album_name: 'album1', track_name: 't8', ts: OLD_SUNDAY },
                // album2 -> 7 distinct tracks within last year (should win)
                { artist_name: 'artist2', album_name: 'album2', track_name: 'a1', ts: RECENT_SUNDAY },
                { artist_name: 'artist2', album_name: 'album2', track_name: 'a2', ts: RECENT_SUNDAY },
                { artist_name: 'artist2', album_name: 'album2', track_name: 'a3', ts: RECENT_SUNDAY },
                { artist_name: 'artist2', album_name: 'album2', track_name: 'a4', ts: RECENT_SUNDAY },
                { artist_name: 'artist2', album_name: 'album2', track_name: 'a5', ts: RECENT_SUNDAY },
                { artist_name: 'artist2', album_name: 'album2', track_name: 'a6', ts: RECENT_SUNDAY },
                { artist_name: 'artist2', album_name: 'album2', track_name: 'a7', ts: RECENT_SUNDAY },
            ]

            it('ignores listens older than one year', async () => {
                await createTestTable(conn, testData)
                const rows = await testQuery(conn, getFact('cozy_album').sql)
                expect(rows.length).toBe(1)
                expect(rows[0].main_text).toBe('album2')
            })
        })

        describe('minimum 7 distinct tracks rule', () => {
            // prettier-ignore
            const testData: TestStreamEntry[] = [
                // album1 -> only 6 distinct tracks but many listens
                { artist_name: 'artist1', album_name: 'album1', track_name: 't1', ts: RECENT_SUNDAY },
                { artist_name: 'artist1', album_name: 'album1', track_name: 't2', ts: RECENT_SUNDAY },
                { artist_name: 'artist1', album_name: 'album1', track_name: 't3', ts: RECENT_SUNDAY },
                { artist_name: 'artist1', album_name: 'album1', track_name: 't4', ts: RECENT_SUNDAY },
                { artist_name: 'artist1', album_name: 'album1', track_name: 't5', ts: RECENT_SUNDAY },
                { artist_name: 'artist1', album_name: 'album1', track_name: 't6', ts: RECENT_SUNDAY },
                { artist_name: 'artist1', album_name: 'album1', track_name: 't1', ts: RECENT_SUNDAY },
                // album2 -> 7 distinct tracks (should win)
                { artist_name: 'artist2', album_name: 'album2', track_name: 'a1', ts: RECENT_SUNDAY },
                { artist_name: 'artist2', album_name: 'album2', track_name: 'a2', ts: RECENT_SUNDAY },
                { artist_name: 'artist2', album_name: 'album2', track_name: 'a3', ts: RECENT_SUNDAY },
                { artist_name: 'artist2', album_name: 'album2', track_name: 'a4', ts: RECENT_SUNDAY },
                { artist_name: 'artist2', album_name: 'album2', track_name: 'a5', ts: RECENT_SUNDAY },
                { artist_name: 'artist2', album_name: 'album2', track_name: 'a6', ts: RECENT_SUNDAY },
                { artist_name: 'artist2', album_name: 'album2', track_name: 'a7', ts: RECENT_SUNDAY },
            ]

            it('requires at least 7 distinct tracks', async () => {
                await createTestTable(conn, testData)
                const rows = await testQuery(conn, getFact('cozy_album').sql)
                expect(rows.length).toBe(1)
                expect(rows[0].main_text).toBe('album2')
            })
        })

        describe('no eligible album', () => {
            // prettier-ignore
            const testData: TestStreamEntry[] = [
              { artist_name: 'artist1', album_name: 'album1', track_name: 't1', ts: RECENT_SUNDAY },
              { artist_name: 'artist1', album_name: 'album1', track_name: 't2', ts: RECENT_SUNDAY },
              { artist_name: 'artist1', album_name: 'album1', track_name: 't3', ts: RECENT_SUNDAY },
            ]

            it('returns error message if no album satisfies the rules', async () => {
                await createTestTable(conn, testData)
                const rows = await testQuery(conn, getFact('cozy_album').sql)
                expect(rows.length).toBe(1)
                expect(rows[0].fact_type).toBe('cozy_album')
                expect(rows[0].main_text).toBeNull()
                expect(rows[0].second_text).toBe(
                    'This fun fact is unfortunately unavailable'
                )
                expect(rows[0].fact_value).toBeUndefined()
                expect(rows[0].unit).toBeUndefined()
                expect(rows[0].context).toBe(
                    'feel like listening to an album today?'
                )
            })
        })
    })
})
