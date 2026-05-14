export function resolveYear(text: string): number | undefined {
    const y = new Date().getFullYear()
    if (/\blast\s+year\b/i.test(text)) return y - 1
    if (/\b(this|current)\s+year\b/i.test(text)) return y
    const explicit = text.match(/\b(20\d{2})\b/)
    if (explicit) return parseInt(explicit[1], 10)
    return undefined
}
