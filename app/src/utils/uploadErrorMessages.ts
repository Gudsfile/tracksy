export const UPLOAD_ERROR = {
    UNSUPPORTED_CONTENT_TYPE:
        'One or more files have an unsupported content type',
    NO_FILES_IN_ARCHIVE: 'No files found in the archive',
    NO_VALID_RECORDS: 'No valid stream records found',
    NO_FILE_TO_PROCESS: 'No file to process',
} as const

export function getUserMessage(error: unknown): string {
    const msg = error instanceof Error ? error.message : ''
    if (msg === UPLOAD_ERROR.UNSUPPORTED_CONTENT_TYPE)
        return 'Unsupported file type. Upload a Spotify ZIP or JSON, or a Deezer XLSX.'
    if (msg === UPLOAD_ERROR.NO_FILES_IN_ARCHIVE)
        return 'The ZIP archive is empty or unreadable.'
    if (msg === UPLOAD_ERROR.NO_VALID_RECORDS)
        return 'No streaming export recognized. Supported: Spotify (ZIP/JSON), Deezer (XLSX).'
    if (msg === UPLOAD_ERROR.NO_FILE_TO_PROCESS)
        return 'No file received. Try again.'
    return 'Upload failed. Check the file and try again.'
}
