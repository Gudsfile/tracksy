import type { FC } from 'react'
import { useState } from 'react'
import type {
    StreamVarietyQueryResult,
    StreamVarietyStatsQueryResult,
} from './query'
import type { Granularity, EntityType } from '../shared/types'
import { formatTooltipDate } from '../shared/formatTooltipDate'
import { formatBarLabel } from '../shared/formatBarLabel'
import { ChartLegend } from '../shared/ChartLegend'
import {
    ChartCard,
    ChartCardEmpty,
    ChartTooltip,
} from '../../SimpleCharts/shared'
import { EntityTabs } from '../shared/EntityTabs'
import { GranularityTabs } from '../shared/GranularityTabs'
import { InsightList, InsightRow } from '../shared/InsightList'

type TooltipState = {
    x: number
    y: number
    ts: string
    distinct_count: number
    repeat_count: number
    total_count: number
}

type Props = {
    data: StreamVarietyQueryResult[] | undefined
    stats: StreamVarietyStatsQueryResult | undefined
    year: number | undefined
    granularity: Granularity
    availableGranularities: Granularity[]
    onGranularityChange: (g: Granularity) => void
    entity: EntityType
    onEntityChange: (e: EntityType) => void
    isLoading?: boolean
}

const ENTITY_SINGULAR: Record<EntityType, string> = {
    tracks: 'track',
    artists: 'artist',
    albums: 'album',
}

export const StreamVariety: FC<Props> = ({
    data,
    stats,
    year,
    granularity,
    availableGranularities,
    onGranularityChange,
    entity,
    onEntityChange,
    isLoading,
}) => {
    const [tooltip, setTooltip] = useState<TooltipState | null>(null)

    const totalDistinct = stats?.total_distinct ?? 0
    const varietyRate =
        (stats?.total_streams ?? 0) > 0
            ? Math.round(
                  ((stats?.total_distinct ?? 0) / (stats?.total_streams ?? 0)) *
                      100
              )
            : 0
    const maxTotal = data?.length
        ? Math.max(...data.map((d) => d.total_count))
        : 0
    const sparseLabelLayout = granularity !== 'month' || year === undefined

    return (
        <ChartCard
            title="Stream Variety"
            emoji="🔀"
            isLoading={isLoading}
            question="How varied was my listening?"
            headerActions={
                <EntityTabs value={entity} onChange={onEntityChange} />
            }
        >
            <GranularityTabs
                value={granularity}
                available={availableGranularities}
                onChange={onGranularityChange}
            />

            {!data?.length || (stats?.total_streams ?? 0) === 0 ? (
                <ChartCardEmpty
                    message={
                        year !== undefined ? 'No data for this year' : 'No data'
                    }
                />
            ) : (
                <>
                    <div className="overflow-x-auto mt-4">
                        <div
                            className="flex items-end gap-0.5 h-24 mb-1"
                            style={{ minWidth: `${data.length * 4}px` }}
                            onMouseLeave={() => setTooltip(null)}
                        >
                            {data.map((d) => {
                                const height =
                                    maxTotal > 0
                                        ? (d.total_count / maxTotal) * 100
                                        : 0
                                return (
                                    <div
                                        key={d.ts}
                                        className="flex-1 min-w-[3px] flex flex-col rounded-t overflow-hidden"
                                        style={{ height: `${height}%` }}
                                        onMouseEnter={(e) => {
                                            if (d.total_count === 0) return
                                            const rect =
                                                e.currentTarget.getBoundingClientRect()
                                            setTooltip({
                                                x: rect.left + rect.width / 2,
                                                y: rect.top,
                                                ts: d.ts,
                                                distinct_count:
                                                    d.distinct_count,
                                                repeat_count: d.repeat_count,
                                                total_count: d.total_count,
                                            })
                                        }}
                                    >
                                        <div
                                            className="bg-yellow-400"
                                            style={{ flex: d.repeat_count }}
                                        />
                                        <div
                                            className="bg-orange-400"
                                            style={{
                                                flex:
                                                    d.distinct_count ||
                                                    (d.total_count > 0 ? 1 : 0),
                                            }}
                                        />
                                    </div>
                                )
                            })}
                        </div>

                        <div
                            className="flex gap-0.5 mb-4"
                            style={{ minWidth: `${data.length * 4}px` }}
                        >
                            {data.map((d, i) => {
                                const label = formatBarLabel(
                                    d,
                                    i,
                                    data,
                                    year,
                                    granularity
                                )
                                return (
                                    <div
                                        key={d.ts}
                                        className={`flex-1 min-w-[3px] text-[9px] text-gray-400 dark:text-gray-500 ${
                                            sparseLabelLayout
                                                ? 'overflow-visible whitespace-nowrap'
                                                : 'text-center truncate'
                                        }`}
                                    >
                                        {label}
                                    </div>
                                )
                            })}
                        </div>
                    </div>

                    <ChartLegend
                        items={[
                            { color: 'bg-orange-400', label: 'Distinct' },
                            { color: 'bg-yellow-400', label: 'Re-listens' },
                        ]}
                    />

                    <InsightList>
                        <InsightRow
                            label={`Unique ${ENTITY_SINGULAR[entity]}s listened`}
                            value={totalDistinct.toLocaleString()}
                        />
                        <InsightRow
                            label={
                                <>
                                    Variety rate
                                    <span className="ml-1 text-xs font-normal text-gray-400 dark:text-gray-500">
                                        (unique / total streams)
                                    </span>
                                </>
                            }
                            value={`${varietyRate}%`}
                        />
                    </InsightList>
                    {entity !== 'tracks' && (
                        <p className="mt-2 text-xs italic text-gray-400 dark:text-gray-500">
                            Artist and album counts rely on names, not unique
                            IDs. Two different artists or albums sharing the
                            same name are counted as one.
                        </p>
                    )}
                </>
            )}
            {tooltip && (
                <ChartTooltip x={tooltip.x} y={tooltip.y}>
                    <div className="font-semibold">
                        {formatTooltipDate(new Date(tooltip.ts), granularity)}
                    </div>
                    <div className="text-gray-300 dark:text-gray-400">
                        {tooltip.distinct_count.toLocaleString()} distinct
                    </div>
                    <div className="text-gray-300 dark:text-gray-400">
                        {tooltip.repeat_count.toLocaleString()} re-listens
                    </div>
                    <div className="text-gray-300 dark:text-gray-400">
                        {tooltip.total_count > 0
                            ? Math.round(
                                  (tooltip.distinct_count /
                                      tooltip.total_count) *
                                      100
                              )
                            : 0}
                        % variety
                    </div>
                    <div className="text-gray-300 dark:text-gray-400">
                        {tooltip.distinct_count > 0
                            ? Math.round(
                                  tooltip.total_count / tooltip.distinct_count
                              )
                            : 0}{' '}
                        avg listens/{ENTITY_SINGULAR[entity]}
                    </div>
                </ChartTooltip>
            )}
        </ChartCard>
    )
}
