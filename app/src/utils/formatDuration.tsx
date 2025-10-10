export function formatDuration(ms: number | bigint) {
    if (ms === undefined) return 'undefined'
    const msBigint = BigInt(ms)

    const seconds = msBigint / 1000n
    const days = seconds / (3600n * 24n)
    const hours = (seconds % (3600n * 24n)) / 3600n
    const minutes = (seconds % 3600n) / 60n
    const secs = seconds % 60n

    const result: string[] = []
    if (days > 0n) result.push(`${days}d`)
    if (hours > 0n || days > 0n) result.push(`${hours}h`)
    if (minutes > 0n || hours > 0n || days > 0n) result.push(`${minutes}m`)
    result.push(`${secs}s`)

    return result.join(' ')
}
