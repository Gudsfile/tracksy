import { AppleMusicStreamProvider } from './AppleMusicStreamProvider/AppleMusicStreamProvider'
import { CustomStreamProvider } from './CustomStreamProvider/CustomStreamProvider'
import { DeezerStreamProvider } from './DeezerStreamProvider/DeezerStreamProvider'
import { JellyFinStreamProvider } from './JellyFinStreamProvider/JellyFinStreamProvider'
import type { StreamProvider } from './StreamProvider'
import { SpotifyStreamProvider } from './SpotifyStreamProvider/SpotifyStreamProvider'

const STREAM_PROVIDERS: StreamProvider[] = [
    new SpotifyStreamProvider(),
    new DeezerStreamProvider(),
    new AppleMusicStreamProvider(),
    new CustomStreamProvider(),
    new JellyFinStreamProvider(),
]

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

export function getSupportedProviderNames(): string[] {
    return STREAM_PROVIDERS.filter((p) => !p.experimental).map(
        (p) => `${p.displayName} (${p.acceptedFormats})`
    )
}
