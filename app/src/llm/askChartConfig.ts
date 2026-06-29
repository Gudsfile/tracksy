import type { MLCEngineInterface } from '@mlc-ai/web-llm'
import { inferChartType, type DBRow } from './inferChartType'
import { devBus } from '../devToolbar/devBus'
import { selectModelId } from './engine'

export type ChartConfig =
    | {
          type: 'ranked_list'
          labelKey: string
          valueKey: string
          secondaryKey?: string
      }
    | { type: 'labeled_segments'; segmentKeys: string[]; totalKey: string }
    | { type: 'skip_rate' }
    | { type: 'calendar_heatmap'; dateKey: string; countKey: string }
    | { type: 'radial'; angleKey: string; countKey: string }
    | { type: 'metric'; key: string }
    | { type: 'bar' | 'line'; x: string; y: string }
    | { type: 'table' }

const SYSTEM_PROMPT = `You are a chart type selector. Given a user question, column names with their types, and the row count, output a JSON chart config.

Available types:
- "ranked_list"      — ordered rows: 1 string label + 1 numeric score (top artists, tracks, weekdays…). Add "secondaryKey" for a subtitle column.
- "labeled_segments" — single row with named segment columns that sum to a total (morning/afternoon/…, winter/spring/…). Include ALL segment column names in "segmentKeys".
- "skip_rate"        — exactly 2 columns: complete_listens and skipped_listens (single row).
- "calendar_heatmap" — columns: a date string (YYYY-MM-DD) + a stream count.
- "radial"           — columns: play_hour (0-23) + count_streams.
- "metric"           — 1 row, 1 numeric column.
- "bar"              — categorical comparison: string x-axis + numeric y-axis.
- "line"             — time series or trend: date/year/month on x-axis + numeric y-axis.
- "table"            — fallback: many columns, no clear shape.

Output ONLY a JSON object, no markdown, no explanation.`

const FEW_SHOTS: { user: string; assistant: string }[] = [
    {
        user: 'Question: Who are my top artists?\nColumns: artist_name(string), count_streams(number), ms_played(number)\nRows: 10',
        assistant:
            '{"type":"ranked_list","labelKey":"artist_name","valueKey":"count_streams","secondaryKey":"ms_played"}',
    },
    {
        user: 'Question: How many tracks did I stream in total?\nColumns: total_streams(number)\nRows: 1',
        assistant: '{"type":"metric","key":"total_streams"}',
    },
    {
        user: 'Question: How has my listening evolved over the years?\nColumns: stream_year(number), stream_count(number), ms_played(number)\nRows: 6',
        assistant: '{"type":"line","x":"stream_year","y":"stream_count"}',
    },
    {
        user: 'Question: Compare my streaming by platform\nColumns: platform(string), count_streams(number)\nRows: 5',
        assistant: '{"type":"bar","x":"platform","y":"count_streams"}',
    },
    {
        user: 'Question: What time of day do I listen the most?\nColumns: morning(number), afternoon(number), evening(number), night(number), total(number)\nRows: 1',
        assistant:
            '{"type":"labeled_segments","segmentKeys":["morning","afternoon","evening","night"],"totalKey":"total"}',
    },
    {
        user: 'Question: Do I skip tracks often?\nColumns: complete_listens(number), skipped_listens(number)\nRows: 1',
        assistant: '{"type":"skip_rate"}',
    },
    {
        user: 'Question: Show my listening calendar for 2025\nColumns: stream_date(string), stream_count(number)\nRows: 365',
        assistant:
            '{"type":"calendar_heatmap","dateKey":"stream_date","countKey":"stream_count"}',
    },
    {
        user: 'Question: Show my listening by hour\nColumns: play_hour(number), count_streams(number), ms_played(number)\nRows: 24',
        assistant:
            '{"type":"radial","angleKey":"play_hour","countKey":"count_streams"}',
    },
    {
        user: 'Question: Show me my raw data\nColumns: track_name(string), artist_name(string), ts(string), ms_played(number), platform(string)\nRows: 50',
        assistant: '{"type":"table"}',
    },
]

function schemaLine(rows: DBRow[]): string {
    const first = rows[0]
    return Object.keys(first)
        .map((k) => {
            const t = typeof first[k]
            return `${k}(${t === 'number' ? 'number' : 'string'})`
        })
        .join(', ')
}

function parseChartConfig(raw: string, rows: DBRow[]): ChartConfig {
    const fenceMatch = raw.match(/```(?:json)?\s*([\s\S]*?)\s*```/i)
    const candidate = fenceMatch ? fenceMatch[1] : raw
    const start = candidate.indexOf('{')
    const end = candidate.lastIndexOf('}')
    if (start === -1 || end === -1) throw new Error('No JSON found')

    const parsed = JSON.parse(candidate.slice(start, end + 1)) as Record<
        string,
        unknown
    >
    const cols = new Set(Object.keys(rows[0]))

    function col(key: unknown): string {
        if (typeof key !== 'string' || !cols.has(key))
            throw new Error(`Invalid column: ${String(key)}`)
        return key
    }

    switch (parsed.type) {
        case 'ranked_list': {
            const labelKey = col(parsed.labelKey)
            const valueKey = col(parsed.valueKey)
            const secondaryKey =
                typeof parsed.secondaryKey === 'string' &&
                cols.has(parsed.secondaryKey)
                    ? parsed.secondaryKey
                    : undefined
            return { type: 'ranked_list', labelKey, valueKey, secondaryKey }
        }
        case 'labeled_segments': {
            const segmentKeys = Array.isArray(parsed.segmentKeys)
                ? (parsed.segmentKeys as unknown[]).filter(
                      (k): k is string => typeof k === 'string' && cols.has(k)
                  )
                : []
            if (segmentKeys.length === 0)
                throw new Error('No valid segmentKeys')
            const totalKey = col(parsed.totalKey)
            return { type: 'labeled_segments', segmentKeys, totalKey }
        }
        case 'skip_rate': {
            if (!cols.has('complete_listens') || !cols.has('skipped_listens'))
                throw new Error('Missing skip_rate columns')
            return { type: 'skip_rate' }
        }
        case 'calendar_heatmap': {
            const dateKey = col(parsed.dateKey)
            const countKey = col(parsed.countKey)
            return { type: 'calendar_heatmap', dateKey, countKey }
        }
        case 'radial': {
            const angleKey = col(parsed.angleKey)
            const countKey = col(parsed.countKey)
            return { type: 'radial', angleKey, countKey }
        }
        case 'metric': {
            const key =
                typeof parsed.key === 'string' && cols.has(parsed.key)
                    ? parsed.key
                    : [...cols][0]
            return { type: 'metric', key }
        }
        case 'bar':
        case 'line': {
            const x = col(parsed.x)
            const y = col(parsed.y)
            return { type: parsed.type as 'bar' | 'line', x, y }
        }
        case 'table':
            return { type: 'table' }
        default:
            throw new Error(`Unknown type: ${String(parsed.type)}`)
    }
}

/** Converts inferChartType output into the new discriminated ChartConfig, used as a fallback. */
export function inferConfig(rows: DBRow[]): ChartConfig {
    if (!rows.length) return { type: 'table' }
    const type = inferChartType(rows)
    const keys = Object.keys(rows[0])
    if (type === 'metric') return { type: 'metric', key: keys[0] }
    if (type === 'list' || type === 'bar' || type === 'line') {
        const labelKey =
            keys.find((k) => typeof rows[0][k] === 'string') ?? keys[0]
        const valueKey =
            keys.find(
                (k) => k !== labelKey && typeof rows[0][k] === 'number'
            ) ?? keys[1]
        if (type === 'list') return { type: 'ranked_list', labelKey, valueKey }
        return { type, x: labelKey, y: valueKey }
    }
    return { type: 'table' }
}

export async function askChartConfig(
    engine: MLCEngineInterface,
    question: string,
    rows: DBRow[]
): Promise<ChartConfig> {
    const messages = [
        { role: 'system' as const, content: SYSTEM_PROMPT },
        ...FEW_SHOTS.flatMap((s) => [
            { role: 'user' as const, content: s.user },
            { role: 'assistant' as const, content: s.assistant },
        ]),
        {
            role: 'user' as const,
            content: `Question: ${question}\nColumns: ${schemaLine(rows)}\nRows: ${rows.length}`,
        },
    ]

    const start = performance.now()
    const response = await engine.chat.completions.create({
        messages,
        temperature: 0.1,
        max_tokens: 128,
    })
    const durationMs = performance.now() - start
    const tokens = response.usage?.completion_tokens ?? 0
    devBus.emit('webllm:inference', {
        model: selectModelId(),
        durationMs,
        tokensPerSec: durationMs > 0 ? tokens / (durationMs / 1000) : 0,
    })

    const raw = response.choices[0]?.message?.content ?? ''
    try {
        return parseChartConfig(raw, rows)
    } catch {
        return inferConfig(rows)
    }
}
