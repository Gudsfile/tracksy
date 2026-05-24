import type { MLCEngineInterface } from '@mlc-ai/web-llm'
import type { DBRow } from './inferChartType'
import { devBus } from '../devToolbar/devBus'
import { selectModelId } from './engine'

const NARRATOR_SYSTEM_PROMPT = `You are a music data analyst. Write a concise 2-3 sentence summary that directly answers the user's question using ONLY the data provided.

Rules:
- Only reference names, values, and counts that appear verbatim in the provided data.
- Never invent, guess, or add any information not present in the results.
- Start your response by referencing the first item in the data table by its exact name.
- If the data is insufficient to answer, say so briefly.
- Write in a friendly, conversational tone. Do not repeat the question.`

function rowsToTable(rows: DBRow[]): string {
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
    sql: string,
    rows: DBRow[],
    onChunk: (delta: string) => void,
    explanation?: string
): Promise<string> {
    const dataContext =
        rows.length > 0
            ? `Data (${rows.length} rows total, showing up to 10):\n${rowsToTable(rows)}`
            : explanation
              ? `Chart description: ${explanation}`
              : 'No result data available.'

    const messages = [
        { role: 'system' as const, content: NARRATOR_SYSTEM_PROMPT },
        {
            role: 'user' as const,
            content: `Question: ${question}\n\n${dataContext}\n\nSQL used:\n${sql}`,
        },
    ]

    const start = performance.now()
    let narrative = ''
    let tokens = 0

    const stream = await engine.chat.completions.create({
        messages,
        temperature: 0.1,
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
