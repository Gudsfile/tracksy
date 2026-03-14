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
import sqlQueryPeakHour from './PeakHour.sql?raw'
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

export function queryMorningFavorite(): string {
    return sqlQueryMorningFavorite.replaceAll('${table}', TABLE)
}

export function queryAfternoonFavorite(): string {
    return sqlQueryAfternoonFavorite.replaceAll('${table}', TABLE)
}

export function queryEveningFavorite(): string {
    return sqlQueryEveningFavorite.replaceAll('${table}', TABLE)
}

export function queryNightFavorite(): string {
    return sqlQueryNightFavorite.replaceAll('${table}', TABLE)
}

export function queryWeekendFavorite(): string {
    return sqlQueryWeekendFavorite.replaceAll('${table}', TABLE)
}

export function queryNostalgicReturn(): string {
    return sqlQueryNostalgicReturn.replaceAll('${table}', TABLE)
}

export function queryForgottenArtist(): string {
    return sqlQueryForgottenArtist.replaceAll('${table}', TABLE)
}

export function queryAbsoluteLoyalty(): string {
    return sqlQueryAbsoluteLoyalty.replaceAll('${table}', TABLE)
}

export function querySubscribedArtist(): string {
    return sqlQuerySubscribedArtist.replaceAll('${table}', TABLE)
}

export function queryMusicalAnniversary(): string {
    return sqlQueryMusicalAnniversary.replaceAll('${table}', TABLE)
}

export function queryFirstArtist(): string {
    return sqlQueryFirstArtist.replaceAll('${table}', TABLE)
}

export function queryOneHitWonder(): string {
    return sqlQueryOneHitWonder.replaceAll('${table}', TABLE)
}

export function queryVarietyDay(): string {
    return sqlQueryVarietyDay.replaceAll('${table}', TABLE)
}

export function queryPeakHour(): string {
    return sqlQueryPeakHour.replaceAll('${table}', TABLE)
}

export function queryBingeListener(): string {
    return sqlQueryBingeListener.replaceAll('${table}', TABLE)
}

export function queryCurrentObsession(): string {
    return sqlQueryCurrentObsession.replaceAll('${table}', TABLE)
}

export function queryRecentDiscovery(): string {
    return sqlQueryRecentDiscovery.replaceAll('${table}', TABLE)
}

export function queryMarathon(): string {
    return sqlQueryMarathon.replaceAll('${table}', TABLE)
}

export function queryUnbeatableStreak(): string {
    return sqlQueryUnbeatableStreak.replaceAll('${table}', TABLE)
}

export function queryTrackProposition(): string {
    return sqlQueryTrackProposition.replaceAll('${table}', TABLE)
}

export function queryCozyAlbum(): string {
    return sqlQueryCozyAlbum.replaceAll('${table}', TABLE)
}

export const QUERY_FUNCTIONS = [
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
    queryFirstArtist,
    queryRecentDiscovery,
    queryPeakHour,
    querySubscribedArtist,
    queryMusicalAnniversary,
    queryUnbeatableStreak,
    queryForgottenArtist,
    queryTrackProposition,
    queryCozyAlbum,
]
