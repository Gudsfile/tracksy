import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { ChatChartRouter } from './ChatChartRouter'
import { INTENT_CHART_COLUMNS } from './intentCharts'
import { FEW_SHOTS } from '../../llm/prompt'
import { validateSql } from '../../llm/sqlSafety'
import { makeChatAnswer } from '../../llm/testHelpers'
import type { IntentName } from '../../llm/intents'
import type { DBRow } from '../../llm/inferChartType'

function answer(intent: IntentName, overrides = {}) {
    return makeChatAnswer(intent, overrides)
}

describe('ChatChartRouter intent → bespoke chart', () => {
    it('renders the bespoke TopArtists chart when the rows fit', () => {
        const rows: DBRow[] = [
            {
                artist_name: 'Radiohead',
                count_streams: 1204,
                ms_played: 5_000_000,
            },
        ]
        render(<ChatChartRouter answer={answer('top_artists')} rows={rows} />)
        expect(screen.getByText('Top Artists')).toBeTruthy()
        expect(screen.getByText('Radiohead')).toBeTruthy()
        expect(screen.queryByText('Fallback Title')).toBeNull()
    })

    it('renders the bespoke SkipRate chart from a single aggregate row', () => {
        const rows: DBRow[] = [{ complete_listens: 800, skipped_listens: 200 }]
        render(<ChatChartRouter answer={answer('skip_rate')} rows={rows} />)
        expect(screen.getByText('Skip Mood')).toBeTruthy()
    })

    it('falls back to the generic chart when required columns are missing', () => {
        // top_artists rows missing ms_played → not a 100% match → generic chart.
        const rows: DBRow[] = [
            { artist_name: 'Radiohead', count_streams: 1204 },
        ]
        render(<ChatChartRouter answer={answer('top_artists')} rows={rows} />)
        expect(screen.queryByText('Top Artists')).toBeNull()
        expect(screen.getByText('Fallback Title')).toBeTruthy()
    })

    it('falls back when calendar_heatmap has no year', () => {
        const rows: DBRow[] = [{ stream_date: '2024-01-01', stream_count: 5 }]
        render(
            <ChatChartRouter
                answer={answer('calendar_heatmap', { params: {} })}
                rows={rows}
            />
        )
        // Bespoke CalendarHeatmap would prompt to "Select a year"; the fallback does not.
        expect(screen.queryByText(/Select a year/i)).toBeNull()
        expect(screen.getByText('Fallback Title')).toBeTruthy()
    })

    it('falls back to the generic chart for an unmapped intent', () => {
        const rows: DBRow[] = [{ total_streams: 1550 }]
        render(<ChatChartRouter answer={answer('total_streams')} rows={rows} />)
        expect(screen.getByText('Fallback Title')).toBeTruthy()
        expect(screen.getByText(/1[,.]?550/)).toBeTruthy()
    })
})

describe('prompt few-shots stay aligned with the chart registry', () => {
    const shotsByIntent = new Map<string, string[]>()
    for (const shot of FEW_SHOTS) {
        const parsed = JSON.parse(shot.assistant) as ChatAnswer
        const list = shotsByIntent.get(parsed.intent) ?? []
        list.push(parsed.sql)
        shotsByIntent.set(parsed.intent, list)
    }

    it.each(Object.entries(INTENT_CHART_COLUMNS))(
        'has a few-shot for %s that emits every required column',
        (intent, columns) => {
            const sqls = shotsByIntent.get(intent) ?? []
            expect(
                sqls.length,
                `no few-shot for intent ${intent}`
            ).toBeGreaterThan(0)
            const matching = sqls.some((sql) =>
                (columns as string[]).every((col) =>
                    new RegExp(`\\b${col}\\b`).test(sql)
                )
            )
            expect(
                matching,
                `no ${intent} few-shot emits all of: ${(columns as string[]).join(', ')}`
            ).toBe(true)
        }
    )

    it('every few-shot SQL passes validateSql', () => {
        for (const shot of FEW_SHOTS) {
            const { sql } = JSON.parse(shot.assistant) as ChatAnswer
            const result = validateSql(sql)
            expect(result.ok, sql).toBe(true)
        }
    })
})
