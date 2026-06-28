import type { MLCEngineInterface } from '@mlc-ai/web-llm'
import type { DBRow } from './inferChartType'
import { devBus } from '../devToolbar/devBus'
import { selectModelId } from './engine'

const NARRATOR_SYSTEM_PROMPT = `You are a witty music companion who comments on someone's listening data like a knowledgeable friend, not a report generator.

Given the user's question and their actual streaming data, write 1-3 engaging sentences that feel like a personal observation — highlight what is striking, dominant, or worth noticing in the numbers.

Rules:
- Ground every claim in the provided data. Never invent names, numbers, or genres not in the results.
- Lead with an insight or observation, not a list. Avoid starting with "Based on the data" or "According to the results".
- Use "you" and speak conversationally.
- hours_played is already computed in the data (ms ÷ 3 600 000). Use it directly — never invent or recalculate time values.
- If one item clearly dominates, say so. If the top and second are close, note that.
- Keep it to 1-3 sentences. Be warm, not formal.
- If no data is available, say so briefly in one sentence.`

function humanizeRows(rows: DBRow[]): DBRow[] {
    return rows.map((r) => {
        if (!('ms_played' in r)) return r
        const { ms_played, ...rest } = r
        const hours =
            typeof ms_played === 'number'
                ? Math.round((ms_played / 3_600_000) * 100) / 100
                : ms_played
        return { ...rest, hours_played: hours }
    })
}

function rowsToTable(rows: DBRow[]): string {
    if (rows.length === 0) return '(no data)'
    const sample = rows.slice(0, 10)
    const keys = Object.keys(sample[0])
    const header = `| ${keys.join(' | ')} |`
    const sep = `| ${keys.map(() => '---').join(' | ')} |`
    const body = sample
        .map((r) => `| ${keys.map((k) => String(r[k] ?? '')).join(' | ')} |`)
        .join('\n')
    return `${header}\n${sep}\n${body}`
}

export async function askNarrator(
    engine: MLCEngineInterface,
    question: string,
    rows: DBRow[],
    onChunk: (delta: string) => void,
    explanation?: string
): Promise<string> {
    const sample = humanizeRows(rows.slice(0, 10))
    const dataContext =
        sample.length > 0
            ? `Data (${rows.length} rows total, showing up to 10):\n${rowsToTable(sample)}`
            : explanation
              ? `Chart description: ${explanation}`
              : 'No result data available.'

    const messages = [
        { role: 'system' as const, content: NARRATOR_SYSTEM_PROMPT },
        {
            role: 'user' as const,
            content: `Question: ${question}\n\n${dataContext}`,
        },
    ]

    const start = performance.now()
    let narrative = ''
    let tokens = 0

    const stream = await engine.chat.completions.create({
        messages,
        temperature: 0.3,
        max_tokens: 256,
        stream: true,
    })

    for await (const chunk of stream) {
        const delta = chunk.choices[0]?.delta?.content ?? ''
        if (delta) {
            narrative += delta
            onChunk(delta)
        }
        tokens += chunk.usage?.completion_tokens ?? 0
    }

    const durationMs = performance.now() - start
    devBus.emit('webllm:inference', {
        model: selectModelId(),
        durationMs,
        tokensPerSec: durationMs > 0 ? tokens / (durationMs / 1000) : 0,
    })

    return narrative
}
