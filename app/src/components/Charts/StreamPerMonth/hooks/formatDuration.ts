export function formatDuration(ms: number) {
    const seconds = Math.floor(ms / 1000)
    const days = Math.floor(seconds / (3600 * 24))
    const hours = Math.floor((seconds % (3600 * 24)) / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60

    let result = []
    if (days > 0) result.push(`${days}j`)
    if (hours > 0 || days > 0) result.push(`${hours}h`)
    if (minutes > 0 || hours > 0 || days > 0) result.push(`${minutes}m`)
    result.push(`${secs}s`)

    return result.join(' ')
}
