export function isSpotifyFilename(file: File) {
    return (
        file.name.match(
            /^Streaming_History_Audio_\d{4}(-\d{4})?(_\d+)?\.json$/i
        ) !== null
    )
}
