import { LLMError } from './types'

type Delimiters = { open: '{' | '['; close: '}' | ']'; name: string }

const OBJECT: Delimiters = { open: '{', close: '}', name: 'object' }
const ARRAY: Delimiters = { open: '[', close: ']', name: 'array' }

/**
 * Extract the first balanced JSON value from raw model output, tolerating
 * markdown fences and trailing commentary.
 *
 * Models routinely wrap their JSON in ```json fences or bracket it with prose,
 * so the payload has to be located by bracket counting rather than trusting the
 * whole string. Quoted brackets and escapes are skipped so a `{` inside a
 * string value can't unbalance the scan.
 */
function extract(raw: string, { open, close, name }: Delimiters): string {
    // Strip markdown code fences if the model added them
    const fenceMatch = raw.match(/```(?:json)?\s*([\s\S]*?)\s*```/i)
    const candidate = fenceMatch ? fenceMatch[1] : raw

    const start = candidate.indexOf(open)
    if (start === -1) {
        throw new LLMError(`No JSON ${name} found in model output.`, 'parse')
    }
    let depth = 0
    let inString = false
    let escape = false
    for (let i = start; i < candidate.length; i++) {
        const c = candidate[i]
        if (escape) {
            escape = false
            continue
        }
        if (c === '\\') {
            escape = true
            continue
        }
        if (c === '"') {
            inString = !inString
            continue
        }
        if (inString) continue
        if (c === open) depth++
        else if (c === close) {
            depth--
            if (depth === 0) return candidate.slice(start, i + 1)
        }
    }
    throw new LLMError(`Unbalanced JSON brackets in model output.`, 'parse')
}

/** The first balanced `{...}` in raw model output. */
export function extractJsonObject(raw: string): string {
    return extract(raw, OBJECT)
}

/** The first balanced `[...]` in raw model output. */
export function extractJsonArray(raw: string): string {
    return extract(raw, ARRAY)
}
