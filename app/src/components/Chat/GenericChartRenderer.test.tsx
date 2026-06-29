import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { GenericChartRenderer } from './GenericChartRenderer'
import type { ChartConfig } from '../../llm/askChartConfig'
import type { DBRow } from '../../llm/inferChartType'
import { FEW_SHOTS } from '../../llm/prompt'
import { validateSql } from '../../llm/sqlSafety'

type ChatAnswer = { intent: string; sql: string }

describe('GenericChartRenderer — ranked_list', () => {
    it('renders artist names and stream counts', () => {
        const rows: DBRow[] = [
            {
                artist_name: 'Radiohead',
                count_streams: 1204,
                ms_played: 5_000_000,
            },
            { artist_name: 'Björk', count_streams: 800, ms_played: 3_000_000 },
        ]
        const config: ChartConfig = {
            type: 'ranked_list',
            labelKey: 'artist_name',
            valueKey: 'count_streams',
            secondaryKey: 'ms_played',
        }
        render(
            <GenericChartRenderer
                title="Top Artists"
                rows={rows}
                chartConfig={config}
            />
        )
        expect(screen.getByText('Top Artists')).toBeTruthy()
        expect(screen.getByText('Radiohead')).toBeTruthy()
        expect(screen.getByText('1,204')).toBeTruthy()
    })
})

describe('GenericChartRenderer — labeled_segments', () => {
    it('renders the dominant period as hero and all segments as bars', () => {
        const rows: DBRow[] = [
            {
                morning: 200,
                afternoon: 500,
                evening: 300,
                night: 100,
                total: 1100,
            },
        ]
        const config: ChartConfig = {
            type: 'labeled_segments',
            segmentKeys: ['morning', 'afternoon', 'evening', 'night'],
            totalKey: 'total',
        }
        render(
            <GenericChartRenderer
                title="Daily Vibes"
                rows={rows}
                chartConfig={config}
            />
        )
        // Afternoon (500) is dominant → appears in hero + in the segment list
        expect(screen.getAllByText('Afternoon').length).toBeGreaterThanOrEqual(
            1
        )
        expect(screen.getByText('Morning')).toBeTruthy()
    })
})

describe('GenericChartRenderer — skip_rate', () => {
    it('renders complete vs skipped counts and a classification', () => {
        const rows: DBRow[] = [{ complete_listens: 800, skipped_listens: 200 }]
        const config: ChartConfig = { type: 'skip_rate' }
        render(
            <GenericChartRenderer
                title="Skip Mood"
                rows={rows}
                chartConfig={config}
            />
        )
        // 80% complete → "Patient"
        expect(screen.getByText('Patient')).toBeTruthy()
        expect(screen.getByText(/80\.0%/)).toBeTruthy()
    })
})

describe('GenericChartRenderer — metric', () => {
    it('renders the metric value prominently', () => {
        const rows: DBRow[] = [{ total_streams: 1550 }]
        const config: ChartConfig = { type: 'metric', key: 'total_streams' }
        render(
            <GenericChartRenderer
                title="Total Streams"
                rows={rows}
                chartConfig={config}
            />
        )
        expect(screen.getByText(/1[,.]?550/)).toBeTruthy()
    })
})

describe('GenericChartRenderer — table fallback', () => {
    it('renders column headers and row data', () => {
        const rows: DBRow[] = [
            { track: 'Creep', artist: 'Radiohead', plays: 10 },
            { track: 'Army of Me', artist: 'Björk', plays: 7 },
        ]
        const config: ChartConfig = { type: 'table' }
        render(
            <GenericChartRenderer
                title="Raw Data"
                rows={rows}
                chartConfig={config}
            />
        )
        expect(screen.getByText('track')).toBeTruthy()
        expect(screen.getByText('Creep')).toBeTruthy()
    })
})

describe('GenericChartRenderer — no config (inferConfig fallback)', () => {
    it('falls back to ranked_list for two-column string+number rows', () => {
        const rows: DBRow[] = [
            { platform: 'Spotify', count_streams: 500 },
            { platform: 'YouTube', count_streams: 200 },
        ]
        render(<GenericChartRenderer title="Platforms" rows={rows} />)
        expect(screen.getByText('Spotify')).toBeTruthy()
        expect(screen.getByText('500')).toBeTruthy()
    })

    it('falls back to metric for a single numeric value', () => {
        const rows: DBRow[] = [{ total_streams: 9999 }]
        render(<GenericChartRenderer title="Total" rows={rows} />)
        expect(screen.getByText(/9[,.]?999/)).toBeTruthy()
    })
})

describe('prompt few-shots SQL validity', () => {
    it('every few-shot SQL passes validateSql', () => {
        for (const shot of FEW_SHOTS) {
            const { sql } = JSON.parse(shot.assistant) as ChatAnswer
            const result = validateSql(sql)
            expect(result.ok, sql).toBe(true)
        }
    })
})
