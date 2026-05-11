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
    main_text: string
    second_text?: string
    value: number | string
    unit?: string
    context?: string
}

const build = (sql: string) => sql.replaceAll('${table}', TABLE)

export const queries = {
    morning_favorite: build(sqlQueryMorningFavorite),
    afternoon_favorite: build(sqlQueryAfternoonFavorite),
    evening_favorite: build(sqlQueryEveningFavorite),
    night_favorite: build(sqlQueryNightFavorite),
    weekend_favorite: build(sqlQueryWeekendFavorite),
    nostalgic_return: build(sqlQueryNostalgicReturn),
    forgotten_artist: build(sqlQueryForgottenArtist),
    absolute_loyalty: build(sqlQueryAbsoluteLoyalty),
    subscribed_artist: build(sqlQuerySubscribedArtist),
    musical_anniversary: build(sqlQueryMusicalAnniversary),
    first_artist: build(sqlQueryFirstArtist),
    one_hit_wonder: build(sqlQueryOneHitWonder),
    variety_day: build(sqlQueryVarietyDay),
    binge_listener: build(sqlQueryBingeListener),
    current_obsession: build(sqlQueryCurrentObsession),
    recent_discovery: build(sqlQueryRecentDiscovery),
    marathon: build(sqlQueryMarathon),
    unbeatable_streak: build(sqlQueryUnbeatableStreak),
    track_proposition: build(sqlQueryTrackProposition),
    cozy_album: build(sqlQueryCozyAlbum),
} as const

export const queryDefinitions = Object.entries(queries).map(([name, sql]) => ({
    name,
    sql,
}))
