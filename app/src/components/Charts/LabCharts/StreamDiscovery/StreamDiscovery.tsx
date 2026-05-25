import type { FC } from 'react'
import { useState } from 'react'
import type {
    Entity,
    Granularity,
    StreamDiscoveryQueryResult,
    StreamDiscoveryStatsQueryResult,
} from './query'
import {
    ChartCard,
    ChartCardEmpty,
    ChartTooltip,
} from '../../SimpleCharts/shared'

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
    entity: Entity
    onEntityChange: (e: Entity) => void
    isLoading?: boolean
}

const GRAN_LABELS: Record<Granularity, string> = {
    year: 'Year',
    month: 'Month',
    week: 'Week',
    day: 'Day',
}

const ENTITY_LABELS: Record<Entity, string> = {
    tracks: 'Tracks',
    artists: 'Artists',
    albums: 'Albums',
}

const ENTITY_SINGULAR: Record<Entity, string> = {
    tracks: 'track',
    artists: 'artist',
    albums: 'album',
}

function formatTooltipDate(date: Date, granularity: Granularity): string {
    if (granularity === 'year')
        return date.toLocaleDateString(undefined, { year: 'numeric' })
    if (granularity === 'month')
        return date.toLocaleDateString(undefined, {
            month: 'long',
            year: 'numeric',
        })
    return date.toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
    })
}

function getBarLabel(
    d: StreamDiscoveryQueryResult,
    index: number,
    data: StreamDiscoveryQueryResult[],
    year: number | undefined,
    granularity: Granularity
): string {
    const date = new Date(d.ts)

    if (granularity === 'year') return String(date.getUTCFullYear())

    if (granularity === 'month') {
        if (year !== undefined)
            return date.toLocaleDateString(undefined, { month: 'short' })
        return date.getUTCMonth() === 0 ? String(date.getUTCFullYear()) : ''
    }

    if (granularity === 'week') {
        if (index === 0)
            return date.toLocaleDateString(undefined, { month: 'short' })
        const prev = new Date(data[index - 1].ts)
        return date.getUTCMonth() !== prev.getUTCMonth()
            ? date.toLocaleDateString(undefined, { month: 'short' })
            : ''
    }

    // day
    return date.getUTCDate() === 1
        ? date.toLocaleDateString(undefined, { month: 'short' })
        : ''
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

    const entityTabs = (
        <div className="flex items-center bg-gray-100 dark:bg-slate-800/80 rounded-lg p-1 border border-gray-300/30">
            {(['tracks', 'artists', 'albums'] as const).map((e) => (
                <button
                    key={e}
                    onClick={() => onEntityChange(e)}
                    className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-all ${
                        entity === e
                            ? 'bg-blue-500 text-white shadow-sm'
                            : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
                    }`}
                >
                    {ENTITY_LABELS[e]}
                </button>
            ))}
        </div>
    )

    return (
        <ChartCard
            title="Stream Discovery"
            emoji="🔭"
            isLoading={isLoading}
            question="How many new artists, tracks, or albums did I discover?"
            headerActions={entityTabs}
        >
            <div className="flex items-center bg-gray-100 dark:bg-slate-800/80 rounded-lg p-1 border border-gray-300/30 self-start mb-3">
                {(['year', 'month', 'week', 'day'] as const).map((g) => {
                    const available = availableGranularities.includes(g)
                    const active = granularity === g
                    return (
                        <button
                            key={g}
                            onClick={() => available && onGranularityChange(g)}
                            disabled={!available}
                            className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-all ${
                                active
                                    ? 'bg-blue-500 text-white shadow-sm'
                                    : available
                                      ? 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
                                      : 'text-gray-300 dark:text-gray-600 cursor-not-allowed'
                            }`}
                        >
                            {GRAN_LABELS[g]}
                        </button>
                    )
                })}
            </div>

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
                                const label = getBarLabel(
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

                    <div className="mt-1 mb-3 flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400">
                        <span className="flex items-center gap-1">
                            <span className="inline-block w-2 h-2 rounded-sm bg-rose-800" />
                            New
                        </span>
                        <span className="flex items-center gap-1">
                            <span className="inline-block w-2 h-2 rounded-sm bg-rose-500" />
                            Known
                        </span>
                    </div>

                    <ul
                        className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700"
                        role="list"
                    >
                        <li
                            className="flex justify-between items-center"
                            role="listitem"
                        >
                            <span className="text-sm text-gray-600 dark:text-gray-400">
                                New {ENTITY_SINGULAR[entity]}s discovered
                            </span>
                            <span className="font-bold">
                                {totalNew.toLocaleString()}
                            </span>
                        </li>
                        <li
                            className="flex justify-between items-center mt-1"
                            role="listitem"
                        >
                            <span className="text-sm text-gray-600 dark:text-gray-400">
                                Discovery rate
                                <span className="ml-1 text-xs font-normal text-gray-400 dark:text-gray-500">
                                    (new / total distinct)
                                </span>
                            </span>
                            <span className="font-bold">{discoveryRate}%</span>
                        </li>
                    </ul>
                </>
            )}
            {tooltip && (
                <ChartTooltip x={tooltip.x} y={tooltip.y}>
                    <div className="font-semibold">
                        {formatTooltipDate(new Date(tooltip.ts), granularity)}
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
