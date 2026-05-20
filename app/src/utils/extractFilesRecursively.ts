import { openArchive } from './openArchive'

const HIDDEN_FILE_PREFIXES = ['__MACOSX']

function isHidden(name: string): boolean {
    return HIDDEN_FILE_PREFIXES.some((prefix) => name.startsWith(prefix))
}

function hasZipExtension(file: File): boolean {
    return file.name.toLowerCase().endsWith('.zip')
}

/**
 * Recursively extracts all non-hidden files from a ZIP archive.
 * If any extracted file is itself a ZIP, it is extracted recursively.
 * Terminates when no extracted file has a .zip extension.
 */
export async function extractFilesRecursively(zipFile: File): Promise<File[]> {
    const archive = await openArchive(zipFile)
    const extracted: Record<string, File | Record<string, File>> =
        await archive.extractFiles()

    const topLevel: File[] = Object.entries(extracted)
        .filter(([key]) => !isHidden(key))
        .flatMap(([, value]) =>
            value instanceof File ? [value] : Object.values(value)
        )
        .filter((file) => !isHidden(file.name))

    const result: File[] = []

    for (const file of topLevel) {
        if (hasZipExtension(file)) {
            const nested = await extractFilesRecursively(file)
            result.push(...nested)
        } else {
            result.push(file)
        }
    }

    return result
}
