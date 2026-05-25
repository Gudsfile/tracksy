import { TABLE } from '../../../../db/queries/constants'
import { buildYearCondition } from '../../../../db/queries/buildYearCondition'
import sqlQueryStreamDiscovery from './StreamDiscovery.sql?raw'
import sqlQueryStreamDiscoveryStats from './StreamDiscoveryStats.sql?raw'

export type Granularity = 'year' | 'month' | 'week' | 'day'

export type Entity = 'tracks' | 'artists' | 'albums'

export type StreamDiscoveryQueryResult = {
    ts: string
    new_count: number
    known_count: number
    total_count: number
}

export type StreamDiscoveryStatsQueryResult = {
    total_new: number
    total_known: number
    total_distinct: number
}

const ENTITY_COLUMN: Record<Entity, string> = {
    tracks: 'track_uri',
    artists: 'artist_name',
    albums: 'album_name',
}

type GranConfig = {
    periodTrunc: (col: string) => string
    spineStart: (minCol: string, perYear: boolean) => string
    spineEnd: (maxCol: string, perYear: boolean) => string
    step: string
}

const GRAN_CONFIG: Record<Granularity, GranConfig> = {
    year: {
        periodTrunc: (col) => `make_date(year(${col}), 1, 1)`,
        spineStart: (col) => `make_date(year(${col}), 1, 1)`,
        spineEnd: (col) => `make_date(year(${col}), 1, 1)`,
        step: `interval 1 year`,
    },
    month: {
        periodTrunc: (col) => `make_date(year(${col}), month(${col}), 1)`,
        spineStart: (col, perYear) =>
            perYear
                ? `make_date(year(${col}), 1, 1)`
                : `make_date(year(${col}), month(${col}), 1)`,
        spineEnd: (col, perYear) =>
            perYear
                ? `make_date(year(${col}), 12, 1)`
                : `make_date(year(${col}), month(${col}), 1)`,
        step: `interval 1 month`,
    },
    week: {
        periodTrunc: (col) => `date_trunc('week', ${col})`,
        spineStart: (col, perYear) =>
            perYear
                ? `date_trunc('week', make_date(year(${col}), 1, 1))`
                : `date_trunc('week', ${col})`,
        spineEnd: (col, perYear) =>
            perYear
                ? `date_trunc('week', make_date(year(${col}), 12, 31))`
                : `date_trunc('week', ${col})`,
        step: `interval 7 days`,
    },
    day: {
        periodTrunc: (col) => `${col}::date`,
        spineStart: (col) => `make_date(year(${col}), 1, 1)`,
        spineEnd: (col) => `make_date(year(${col}), 12, 31)`,
        step: `interval 1 day`,
    },
}

export function queryStreamDiscoveryStats(
    year: number | undefined,
    entity: Entity
): string {
    const yearCondition = buildYearCondition(year)
    const newCondition =
        year !== undefined ? `year(f.first_date) = ${year}` : 'true'
    return sqlQueryStreamDiscoveryStats
        .replaceAll('${entity_column}', ENTITY_COLUMN[entity])
        .replaceAll('${table}', TABLE)
        .replaceAll('${year_condition}', yearCondition)
        .replaceAll('${new_condition}', newCondition)
}

export function queryStreamDiscovery(
    year: number | undefined,
    granularity: Granularity,
    entity: Entity
): string {
    const yearCondition = buildYearCondition(year)
    const perYear = year !== undefined
    const { periodTrunc, spineStart, spineEnd, step } = GRAN_CONFIG[granularity]
    const minExpr = `(select min(ts::date) from ${TABLE} where ${yearCondition})`
    const maxExpr = `(select max(ts::date) from ${TABLE} where ${yearCondition})`

    return sqlQueryStreamDiscovery
        .replaceAll('${spineTimeTrunc}', periodTrunc('t.dt'))
        .replaceAll('${firstDateTrunc}', periodTrunc('first_date'))
        .replaceAll('${streamTimeTrunc}', periodTrunc('stream_date'))
        .replaceAll('${entity_column}', ENTITY_COLUMN[entity])
        .replaceAll('${spineStart}', spineStart(minExpr, perYear))
        .replaceAll('${spineEnd}', spineEnd(maxExpr, perYear))
        .replaceAll('${step}', step)
        .replaceAll('${table}', TABLE)
        .replaceAll('${year_condition}', yearCondition)
}
