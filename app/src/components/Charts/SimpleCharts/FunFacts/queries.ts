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
import sqlQueryCurrentObsession from './CurrentObsession.sql?raw'
import sqlQueryRecentDiscovery from './RecentDiscovery.sql?raw'
import sqlQueryMarathon from './Marathon.sql?raw'
import sqlQueryTrackProposition from './TrackProposition.sql?raw'
import sqlQueryCozyAlbum from './CozyAlbum.sql?raw'

export type FunFactData = {
    entity: string
    parent_entity?: string
    metric?: number
    context_suffix?: string
}

const build = (sql: string) => sql.replaceAll('${table}', TABLE)

export const facts = [
    {
        fact_type: 'morning_favorite',
        title: '🌅 Musical Breakfast',
        emoji: '🥐',
        unit: 'streams',
        context: 'between 6am and 12pm',
        sql: build(sqlQueryMorningFavorite),
    },
    {
        fact_type: 'afternoon_favorite',
        title: '🏞️ Afternoon Boost',
        emoji: '⚡️',
        unit: 'streams',
        context: 'between 12pm and 6pm',
        sql: build(sqlQueryAfternoonFavorite),
    },
    {
        fact_type: 'evening_favorite',
        title: '🌆 Calm Return',
        emoji: '🛋️',
        unit: 'streams',
        context: 'between 6pm and 0am',
        sql: build(sqlQueryEveningFavorite),
    },
    {
        fact_type: 'night_favorite',
        title: '🌌 Musical Insomnia',
        emoji: '💤',
        unit: 'streams',
        context: 'between 0am and 6am',
        sql: build(sqlQueryNightFavorite),
    },
    {
        fact_type: 'weekend_favorite',
        title: '🧉 Weekend Vibes',
        emoji: '🕺',
        unit: 'streams',
        context: 'on weekends',
        sql: build(sqlQueryWeekendFavorite),
    },
    {
        fact_type: 'nostalgic_return',
        title: '📻 Signal Found',
        emoji: '🛰️',
        unit: 'days',
        context: "later, it's back",
        sql: build(sqlQueryNostalgicReturn),
    },
    {
        fact_type: 'forgotten_artist',
        title: '🥀 Fading Away',
        emoji: '🌫️',
        unit: 'days',
        context: 'off your radar',
        sql: build(sqlQueryForgottenArtist),
    },
    {
        fact_type: 'absolute_loyalty',
        title: '💎 Absolute Loyalty',
        emoji: '💍',
        unit: '%',
        context: 'of your plays went all the way',
        sql: build(sqlQueryAbsoluteLoyalty),
    },
    {
        fact_type: 'subscribed_artist',
        title: '🎟️ Monthly Subscription',
        emoji: '📬',
        unit: 'months',
        context: 'in your rotation',
        sql: build(sqlQuerySubscribedArtist),
    },
    {
        fact_type: 'musical_anniversary',
        title: '🎉 Musical Anniversary',
        emoji: '🎂',
        unit: 'years',
        context: 'strong',
        sql: build(sqlQueryMusicalAnniversary),
    },
    {
        fact_type: 'first_artist',
        title: '1️⃣ The Very First',
        emoji: '🦖',
        unit: undefined,
        context: 'still in your rotation today?',
        sql: build(sqlQueryFirstArtist),
    },
    {
        fact_type: 'one_hit_wonder',
        title: '⭐ One Hit Wonder',
        emoji: '📼',
        unit: '%',
        context: 'of your streams of',
        sql: build(sqlQueryOneHitWonder),
    },
    {
        fact_type: 'current_obsession',
        title: '🔁 Current Obsession',
        emoji: '🎯',
        unit: 'streams',
        context: 'in the last 30 days',
        sql: build(sqlQueryCurrentObsession),
    },
    {
        fact_type: 'recent_discovery',
        title: '🔍 Recent Discovery',
        emoji: '✨',
        unit: 'streams',
        context: 'discovered in the last 3 months',
        sql: build(sqlQueryRecentDiscovery),
    },
    {
        fact_type: 'marathon',
        title: '🏃 Marathon',
        emoji: '☄️',
        unit: 'streams in a row',
        context: 'one uninterrupted run on',
        sql: build(sqlQueryMarathon),
    },
    {
        fact_type: 'track_proposition',
        title: '▶️ Up Next',
        emoji: '🔮',
        unit: undefined,
        context: 'your next listen is already waiting',
        sql: build(sqlQueryTrackProposition),
    },
    {
        fact_type: 'cozy_album',
        title: '💿 Cozy Album',
        emoji: '☁️',
        unit: undefined,
        context: 'the album that wraps your Sundays in musical coziness',
        sql: build(sqlQueryCozyAlbum),
    },
] as const
