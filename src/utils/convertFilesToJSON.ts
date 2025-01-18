export async function convertFilesToJSON(
    files: FileList
): Promise<Record<string, unknown>[]> {
    const filePromises = Array.from(files).map(async (file) => {
        console.debug(`File ${file.name} is being processed.`)
        const rawContent = await file.text()
        return JSON.parse(rawContent)
    })

    const fileContents = await Promise.all(filePromises)
    return fileContents.flat()
}
