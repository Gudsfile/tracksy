import type { BaseAdapter } from './BaseAdapter'
import { SpotifyAdapter } from './spotify/SpotifyAdapter'

// Registry of all available provider adapters
const ADAPTERS: BaseAdapter[] = [new SpotifyAdapter()]

export function detectProvider(file: File): BaseAdapter | undefined {
    for (const adapter of ADAPTERS) {
        if (adapter.validateFile(file)) {
            return adapter
        }
    }
    return undefined
}

export function isFileSupported(file: File): boolean {
    return detectProvider(file) !== undefined
}

export const isAllowedFileContentType = (file: File) => {
    return ADAPTERS.some(
        (adapter) => adapter.getMetadata().fileContentType === file.type
    )
}
