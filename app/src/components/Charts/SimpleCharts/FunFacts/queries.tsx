import { TABLE } from '../../../../db/queries/constants'
import sqlQueryMorningFavorite from './MorningFavorite.sql?raw'
import sqlQueryAfternoonFavorite from './AfternoonFavorite.sql?raw'
import sqlQueryEveningFavorite from './EveningFavorite.sql?raw'
import sqlQueryNightFavorite from './NightFavorite.sql?raw'
import sqlQueryWeekendFavorite from './WeekendFavorite.sql?raw'
import sqlQueryNostalgicReturn from './NostalgicReturn.sql?raw'
import sqlQueryForgottenArtist from './ForgottenArtist.sql?raw'
import sqlQueryAbsoluteLoyalty from './AbsoluteLoyalty.sql?raw'
import sqlQuerySubscribedArtist from './SubscribedArtist.sql?raw'
import sqlQueryMusicalAnniversary from './MusicalAnniversary.sql?raw'
import sqlQueryFirstArtist from './FirstArtist.sql?raw'
import sqlQueryOneHitWonder from './OneHitWonder.sql?raw'
import sqlQueryVarietyDay from './VarietyDay.sql?raw'
import sqlQueryBingeListener from './BingeListener.sql?raw'
import sqlQueryCurrentObsession from './CurrentObsession.sql?raw'
import sqlQueryRecentDiscovery from './RecentDiscovery.sql?raw'
import sqlQueryMarathon from './Marathon.sql?raw'
import sqlQueryUnbeatableStreak from './UnbeatableStreak.sql?raw'
import sqlQueryTrackProposition from './TrackProposition.sql?raw'
import sqlQueryCozyAlbum from './CozyAlbum.sql?raw'

export type FunFactResult = {
    fact_type: string
    main_text: string | null
    second_text?: string
    value?: number | string
    unit?: string
    context?: string
}

const build = (sql: string) => sql.replaceAll('${table}', TABLE)

export const facts = [
    {
        fact_type: 'morning_favorite',
        title: '🌅 Musical Breakfast',
        emoji: '🥐',
        sql: build(sqlQueryMorningFavorite),
    },
    {
        fact_type: 'afternoon_favorite',
        title: '☀️ Afternoon Boost',
        emoji: '⚡️',
        sql: build(sqlQueryAfternoonFavorite),
    },
    {
        fact_type: 'evening_favorite',
        title: '🌆 Calm Return',
        emoji: '🛋️',
        sql: build(sqlQueryEveningFavorite),
    },
    {
        fact_type: 'night_favorite',
        title: '🌙 Musical Insomnia',
        emoji: '💤',
        sql: build(sqlQueryNightFavorite),
    },
    {
        fact_type: 'weekend_favorite',
        title: '🎉 Weekend Vibes',
        emoji: '🕺',
        sql: build(sqlQueryWeekendFavorite),
    },
    {
        fact_type: 'nostalgic_return',
        title: '🕰️ Nostalgic Return',
        emoji: '📼',
        sql: build(sqlQueryNostalgicReturn),
    },
    {
        fact_type: 'forgotten_artist',
        title: '🕰️ Forgotten Artist',
        emoji: '💔',
        sql: build(sqlQueryForgottenArtist),
    },
    {
        fact_type: 'absolute_loyalty',
        title: '❤️ Absolute Loyalty',
        emoji: '💍',
        sql: build(sqlQueryAbsoluteLoyalty),
    },
    {
        fact_type: 'subscribed_artist',
        title: '🎸 Monthly Subscription',
        emoji: '📬',
        sql: build(sqlQuerySubscribedArtist),
    },
    {
        fact_type: 'musical_anniversary',
        title: '🎉 Musical Anniversary',
        emoji: '🎂',
        sql: build(sqlQueryMusicalAnniversary),
    },
    {
        fact_type: 'first_artist',
        title: '🦖 The Very First',
        emoji: '1️⃣',
        sql: build(sqlQueryFirstArtist),
    },
    {
        fact_type: 'one_hit_wonder',
        title: '⭐ One-Hit Wonder',
        emoji: '🎵',
        sql: build(sqlQueryOneHitWonder),
    },
    {
        fact_type: 'variety_day',
        title: '🌈 Variety Day',
        emoji: '🎨',
        sql: build(sqlQueryVarietyDay),
    },
    {
        fact_type: 'binge_listener',
        title: '🎧 Binge Listener',
        emoji: '🎶',
        sql: build(sqlQueryBingeListener),
    },
    {
        fact_type: 'current_obsession',
        title: '🔁 Current Obsession',
        emoji: '🎯',
        sql: build(sqlQueryCurrentObsession),
    },
    {
        fact_type: 'recent_discovery',
        title: '🎵 Recent Discovery',
        emoji: '✨',
        sql: build(sqlQueryRecentDiscovery),
    },
    {
        fact_type: 'marathon',
        title: '🏃 Marathon',
        emoji: '☄️',
        sql: build(sqlQueryMarathon),
    },
    {
        fact_type: 'unbeatable_streak',
        title: '🔥 Unbeatable Streak',
        emoji: '🏆',
        sql: build(sqlQueryUnbeatableStreak),
    },
    {
        fact_type: 'track_proposition',
        title: '🔮 Listening Proposition',
        emoji: '🐙',
        sql: build(sqlQueryTrackProposition),
    },
    {
        fact_type: 'cozy_album',
        title: '💿 Cozy Album',
        emoji: '☁️',
        sql: build(sqlQueryCozyAlbum),
    },
] as const
