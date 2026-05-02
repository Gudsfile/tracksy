import { type SummaryPerYearQueryResult, summarizePerYearQuery } from './query'
import { buildPlot, buildAllTimePlot } from './plot'
import { Common } from '../Common'
import { useCallback } from 'react'

interface SummaryPerYearProps {
    year: number | undefined
}

export function SummaryPerYear({ year }: SummaryPerYearProps) {
    const plotBuilder = useCallback(
        year !== undefined ? buildPlot : buildAllTimePlot,
        [year]
    )
    const { sql, params } = summarizePerYearQuery(year)
    return (
        <Common<SummaryPerYearQueryResult>
            query={sql}
            params={params}
            buildPlot={plotBuilder}
        />
    )
}
