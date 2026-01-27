import type { StreamProvider } from './StreamProvider'
import { SpotifyStreamProvider } from './SpotifyStreamProvider/SpotifyStreamProvider'

// Registry of all available provider adapters
const STREAM_PROVIDERS: StreamProvider[] = [new SpotifyStreamProvider()]

export const STREAM_PROVIDERS_CONTENT_TYPES = STREAM_PROVIDERS.map(
    (provider) => provider.fileContentType
)

export function detectProvider(file: File): StreamProvider | undefined {
    for (const adapter of STREAM_PROVIDERS) {
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
    return STREAM_PROVIDERS_CONTENT_TYPES.some(
        (contentType) => contentType === file.type
    )
}
