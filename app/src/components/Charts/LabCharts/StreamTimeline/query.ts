import { TABLE } from '../../../../db/queries/constants'
import { buildYearCondition } from '../../../../db/queries/buildYearCondition'

export type Granularity = 'year' | 'month' | 'week' | 'day'

export type StreamTimelineQueryResult = {
    ts: string
    ms_played: number
    count_streams: number
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

export function queryStreamTimeline(
    year: number | undefined,
    granularity: Granularity
): string {
    const yearCondition = buildYearCondition(year)
    const perYear = year !== undefined
    const { periodTrunc, spineStart, spineEnd, step } = GRAN_CONFIG[granularity]
    const minExpr = `(select min(ts::date) from ${TABLE} where ${yearCondition})`
    const maxExpr = `(select max(ts::date) from ${TABLE} where ${yearCondition})`
    const streamTrunc = periodTrunc('ts::date')

    return `
with spine as (
    select ${periodTrunc('t.period')} as ts
    from generate_series(${spineStart(minExpr, perYear)}, ${spineEnd(maxExpr, perYear)}, ${step}) as t(period)
),
streams as (
    select
        ${streamTrunc} as ts,
        sum(ms_played) as ms_played,
        count(*) as count_streams
    from ${TABLE}
    where ${yearCondition}
    group by ${streamTrunc}
)
select
    spine.ts::varchar as ts,
    coalesce(streams.ms_played, 0) as ms_played,
    coalesce(streams.count_streams, 0)::int as count_streams
from spine
left join streams on spine.ts = streams.ts
order by spine.ts
`
}
