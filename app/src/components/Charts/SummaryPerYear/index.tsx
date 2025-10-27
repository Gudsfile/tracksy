import { type SummaryPerYearQueryResult, summarizePerYearQuery } from './query'
import { buildPlot } from './plot'
import { Common } from '../Common'
import { useCallback } from 'react'

interface SummaryPerYearProps {
    year: number
}

export function SummaryPerYear({ year }: SummaryPerYearProps) {
    const plotBuilder = useCallback(buildPlot, [])
    return (
        <Common<SummaryPerYearQueryResult>
            query={summarizePerYearQuery(year)}
            buildPlot={plotBuilder}
        />
    )
}
