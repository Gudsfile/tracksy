import { useState } from 'react'
import {
    queryAllTimeTop10Evolution,
    type AllTimeTop10EvolutionQueryResult,
} from './query'
import { AllTimeTop10EvolutionView } from './AllTimeTop10EvolutionView'
import { useDBQueryMany } from '../../../../hooks/useDBQuery'
import { ChartCard } from '../../SimpleCharts/shared/ChartCard'
import { ChartCardEmpty } from '../../SimpleCharts/shared/ChartCardEmpty'
import { ENTITY_LABELS, EntityTabs } from '../shared/EntityTabs'
import type { EntityType } from '../shared/types'

export function AllTimeTop10Evolution({ year }: { year: number | undefined }) {
    const [entityType, setEntityType] = useState<EntityType>('artists')

    const { data: rawData, isLoading } =
        useDBQueryMany<AllTimeTop10EvolutionQueryResult>({
            query: queryAllTimeTop10Evolution(year, entityType),
            year,
        })

    const data = rawData ?? []

    const isInitialLoad = isLoading && data.length === 0

    const entityLabel = ENTITY_LABELS[entityType]

    return (
        <ChartCard
            title={`All-Time Top 10 ${entityLabel} Evolution`}
            emoji="📈"
            className="md:col-span-2 lg:col-span-3"
            isLoading={isInitialLoad}
            question={`How has the yearly ranking of my All-Time Top 10 ${entityLabel} evolved over the years?`}
            headerActions={
                <EntityTabs value={entityType} onChange={setEntityType} />
            }
        >
            {data.length === 0 ? (
                <ChartCardEmpty />
            ) : (
                <div
                    className="transition-opacity duration-150"
                    style={{ opacity: isLoading ? 0.4 : 1 }}
                >
                    <AllTimeTop10EvolutionView data={data} />
                </div>
            )}
        </ChartCard>
    )
}
