import { parseCallerFrame } from './parseCallerFrame'

/**
 * Resolve the calling component name from the current stack, in DEV only.
 * Returns undefined in production builds so no `new Error().stack` cost is paid.
 */
export function resolveCallerSource(): string | undefined {
    return import.meta.env.DEV ? parseCallerFrame(new Error().stack) : undefined
}
