import { TABLE } from '../../../../db/queries/constants'
import { buildYearCondition } from '../../../../db/queries/buildYearCondition'

export type Granularity = 'year' | 'month' | 'week' | 'day'

export type StreamPerMonthQueryResult = {
    ts: string
    ms_played: number
    count_streams: number
}

type GranConfig = {
    periodTrunc: (col: string) => string
    spineStart: (minCol: string) => string
    spineEnd: (maxCol: string) => string
    step: string
}

const GRAN_CONFIG: Record<Granularity, GranConfig> = {
    year: {
        periodTrunc: (col) => `date_trunc('year', ${col})`,
        spineStart: (col) => `date_trunc('year', ${col})`,
        spineEnd: (col) => `date_trunc('year', ${col})`,
        step: `interval 1 year`,
    },
    month: {
        periodTrunc: (col) => `date_trunc('month', ${col})`,
        spineStart: (col) => `date_trunc('month', ${col})`,
        spineEnd: (col) => `date_trunc('month', ${col})`,
        step: `interval 1 month`,
    },
    week: {
        periodTrunc: (col) => `date_trunc('week', ${col})`,
        spineStart: (col) => `date_trunc('week', ${col})`,
        spineEnd: (col) => `date_trunc('week', ${col})`,
        step: `interval 7 days`,
    },
    day: {
        periodTrunc: (col) => `${col}::date`,
        spineStart: (col) => `date_trunc('year', ${col})::date`,
        spineEnd: (col) =>
            `(date_trunc('year', ${col}) + interval '1 year' - interval '1 day')::date`,
        step: `interval 1 day`,
    },
}

export function queryStreamsPerMonth(
    year: number | undefined,
    granularity: Granularity
): string {
    const yearCondition = buildYearCondition(year)
    const { periodTrunc, spineStart, spineEnd, step } = GRAN_CONFIG[granularity]
    const minExpr = `(select min(ts::date) from ${TABLE} where ${yearCondition})`
    const maxExpr = `(select max(ts::date) from ${TABLE} where ${yearCondition})`
    const streamTrunc = periodTrunc('ts::date')

    return `
with spine as (
    select ${periodTrunc('t.period')} as ts
    from generate_series(${spineStart(minExpr)}, ${spineEnd(maxExpr)}, ${step}) as t(period)
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
