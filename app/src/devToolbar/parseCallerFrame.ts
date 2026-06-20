export function parseCallerFrame(
    stack: string | undefined
): string | undefined {
    if (!stack) return undefined
    for (const line of stack.split('\n')) {
        let match = line.match(/components\/(?:.+\/)?([^/]+)\/index\.tsx?:\d+/)
        if (match) return match[1]
        match = line.match(/components\/(?:.+\/)?([^/]+)\.tsx?:\d+/)
        if (match) return match[1]
    }
    return undefined
}
