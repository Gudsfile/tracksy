import { Archive } from 'libarchive.js'
import LibArchiveWorker from 'libarchive.js/dist/worker-bundle.js?url'

export async function openArchive(file: File) {
    Archive.init({
        workerUrl: LibArchiveWorker,
    })
    return await Archive.open(file)
}
