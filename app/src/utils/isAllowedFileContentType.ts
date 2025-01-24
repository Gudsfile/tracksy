const ALLOWED_CONTENT_TYPE = [
    'application/zip',
    'application/json',
    'application/octet-stream',
]

export const isAllowedFileContentType = (file: File) => {
    return ALLOWED_CONTENT_TYPE.includes(file.type)
}
