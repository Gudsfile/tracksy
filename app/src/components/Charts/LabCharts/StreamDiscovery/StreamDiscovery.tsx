import type { FC } from 'react'
import { useState } from 'react'
import type {
    StreamDiscoveryQueryResult,
    StreamDiscoveryStatsQueryResult,
} from './query'
import type { Granularity, EntityType } from '../shared/types'
import { formatTooltipDate } from '../shared/formatTooltipDate'
import { formatBarLabel } from '../shared/formatBarLabel'
import { ChartLegend } from '../shared/ChartLegend'
import { ChartCard } from '../../SimpleCharts/shared/ChartCard'
import { ChartCardEmpty } from '../../SimpleCharts/shared/ChartCardEmpty'
import { ChartTooltip } from '../../SimpleCharts/shared/ChartTooltip'
import { EntityTabs } from '../shared/EntityTabs'
import { GranularityTabs } from '../shared/GranularityTabs'
import { InsightList, InsightRow } from '../shared/InsightList'

type TooltipState = {
    x: number
    y: number
    ts: string
    new_count: number
    known_count: number
    total_count: number
}

type Props = {
    data: StreamDiscoveryQueryResult[] | undefined
    stats: StreamDiscoveryStatsQueryResult | undefined
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

export const StreamDiscovery: FC<Props> = ({
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

    const totalNew = stats?.total_new ?? 0
    const discoveryRate =
        (stats?.total_distinct ?? 0) > 0
            ? Math.round(
                  ((stats?.total_new ?? 0) / (stats?.total_distinct ?? 0)) * 100
              )
            : 0
    const maxTotal = data?.length
        ? Math.max(...data.map((d) => d.total_count))
        : 0
    const sparseLabelLayout = granularity !== 'month' || year === undefined

    return (
        <ChartCard
            title="Stream Discovery"
            emoji="🔭"
            isLoading={isLoading}
            question="How many new artists, tracks, or albums did I discover?"
            headerActions={
                <EntityTabs value={entity} onChange={onEntityChange} />
            }
        >
            <GranularityTabs
                value={granularity}
                available={availableGranularities}
                onChange={onGranularityChange}
            />

            {!data?.length || (stats?.total_distinct ?? 0) === 0 ? (
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
                                                new_count: d.new_count,
                                                known_count: d.known_count,
                                                total_count: d.total_count,
                                            })
                                        }}
                                    >
                                        <div
                                            className="bg-rose-500"
                                            style={{ flex: d.known_count }}
                                        />
                                        <div
                                            className="bg-rose-800"
                                            style={{ flex: d.new_count }}
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
                                    d.ts,
                                    data[i - 1]?.ts,
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
                            { color: 'bg-rose-800', label: 'New' },
                            { color: 'bg-rose-500', label: 'Known' },
                        ]}
                    />

                    <InsightList>
                        <InsightRow
                            label={`New ${ENTITY_SINGULAR[entity]}s discovered`}
                            value={totalNew.toLocaleString()}
                        />
                        <InsightRow
                            label={
                                <>
                                    Discovery rate
                                    <span className="ml-1 text-xs font-normal text-gray-400 dark:text-gray-500">
                                        (new / total distinct)
                                    </span>
                                </>
                            }
                            value={`${discoveryRate}%`}
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
                        {formatTooltipDate(tooltip.ts, granularity)}
                    </div>
                    <div className="text-gray-300 dark:text-gray-400">
                        {tooltip.new_count.toLocaleString()} new
                    </div>
                    <div className="text-gray-300 dark:text-gray-400">
                        {tooltip.known_count.toLocaleString()} known
                    </div>
                    <div className="text-gray-300 dark:text-gray-400">
                        {tooltip.total_count > 0
                            ? Math.round(
                                  (tooltip.new_count / tooltip.total_count) *
                                      100
                              )
                            : 0}
                        % discovery
                    </div>
                </ChartTooltip>
            )}
        </ChartCard>
    )
}
