import type { MLCEngineInterface } from '@mlc-ai/web-llm'
import type { DBRow } from './inferChartType'
import { devBus } from '../devToolbar/devBus'
import { selectModelId } from './engine'

const NARRATOR_SYSTEM_PROMPT = `You are a music data analyst. Given a user's question and context about the visualization, write a concise 2-3 sentence answer that directly addresses the question. When result data is available, mention specific values. When only a chart description is available, describe what the visualization reveals. Write in a friendly, conversational tone. Do not repeat the question.`

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
            ? `Results (${rows.length} rows total, showing up to 10):\n${JSON.stringify(rows.slice(0, 10), null, 2)}`
            : explanation
              ? `Chart description: ${explanation}`
              : 'No result data available.'

    const messages = [
        { role: 'system' as const, content: NARRATOR_SYSTEM_PROMPT },
        {
            role: 'user' as const,
            content: `Question: ${question}\n\nSQL:\n${sql}\n\n${dataContext}`,
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
