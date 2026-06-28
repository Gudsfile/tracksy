import type { MLCEngineInterface } from '@mlc-ai/web-llm'
import {
    inferChartType,
    type CustomChartType,
    type DBRow,
} from './inferChartType'
import { devBus } from '../devToolbar/devBus'
import { selectModelId } from './engine'

export type ChartConfig = {
    type: CustomChartType
    x?: string
    y?: string
}

const SYSTEM_PROMPT = `You are a chart type selector. Given a user question, the column names and their types, and the number of rows, choose the best chart type and which columns to use.

Available types:
- "metric"  — single big number: 1 row, 1 numeric column
- "list"    — ranked items: ≤25 rows, 1 string label + 1 numeric value
- "bar"     — categorical comparison: string x-axis, numeric y-axis, many rows or explicit comparison
- "line"    — trend or time series: date/year/month/hour on x-axis, numeric y-axis
- "table"   — raw data: many columns, complex rows, or no clear chart shape

Output ONLY a JSON object, no markdown, no explanation:
{"type":"...","x":"column_name","y":"column_name"}`

const FEW_SHOTS: { user: string; assistant: string }[] = [
    {
        user: 'Question: Who are my top artists?\nColumns: artist_name(string), count_streams(number), ms_played(number)\nRows: 10',
        assistant: '{"type":"list","x":"artist_name","y":"count_streams"}',
    },
    {
        user: 'Question: How many tracks did I stream in total?\nColumns: total_streams(number)\nRows: 1',
        assistant: '{"type":"metric","x":"total_streams"}',
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
        user: 'Question: Show me my raw streaming data\nColumns: track_name(string), artist_name(string), ts(string), ms_played(number), platform(string)\nRows: 50',
        assistant: '{"type":"table"}',
    },
]

function schemaLine(rows: DBRow[]): string {
    const first = rows[0]
    const cols = Object.keys(first)
        .map((k) => {
            const t = typeof first[k]
            return `${k}(${t === 'number' ? 'number' : 'string'})`
        })
        .join(', ')
    return cols
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
    const validTypes: CustomChartType[] = [
        'metric',
        'bar',
        'line',
        'list',
        'table',
    ]
    if (!validTypes.includes(parsed.type as CustomChartType)) {
        throw new Error(`Invalid type: ${parsed.type}`)
    }

    const colNames = new Set(Object.keys(rows[0]))
    const x =
        typeof parsed.x === 'string' && colNames.has(parsed.x)
            ? parsed.x
            : undefined
    const y =
        typeof parsed.y === 'string' && colNames.has(parsed.y)
            ? parsed.y
            : undefined

    return { type: parsed.type as CustomChartType, x, y }
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
        max_tokens: 64,
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
        return { type: inferChartType(rows) }
    }
}
