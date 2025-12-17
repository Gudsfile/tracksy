import { convertArrayToFileList } from '../../utils/convertArrayToFileList'
import { isAllowedFileContentType } from '../../streamProvider'
import { isZipArchive } from '../../utils/isZipArchive'
import { openArchive } from '../../utils/openArchive'

const HIDDEN_FILE_PREFIX = ['__MACOSX']

/**
 * Custom hook for handling file uploads with validation and processing.
 *
 * @param {Object} params - The parameters for the hook.
 * @param {Function} [params.onSuccess] - Callback function to be called with validated files when the file control is successful.
 * @param {Function} params.onFail - Callback function to be called when the file upload fails.
 *
 * @returns {Object} An object containing the `uploadFiles` function.
 * @returns {Function} returns.uploadFiles - Function to handle the file upload process.
 *
 * @throws {Error} If one or more files have an unsupported content type.
 */
export function useFileUpload({
    onSuccess,
    onFail,
}: {
    onSuccess: (validatedFiles: FileList) => void
    onFail: () => void
}) {
    /**
     * Filters the provided FileList to only include files with allowed content types.
     * Throws an error if any file has an unsupported content type.
     *
     * @param {FileList} files - The list of files to be checked.
     * @throws {Error} If one or more files have an unsupported content type.
     */
    const controlUploadedFiles = (files: FileList) => {
        const isAllowedFileContentTypeOrIsZipArchive = (file: File) => {
            return isAllowedFileContentType(file) || isZipArchive(file)
        }

        const allowedFiles = Array.from(files).filter(
            isAllowedFileContentTypeOrIsZipArchive
        )

        if (allowedFiles.length !== files.length) {
            throw new Error(
                'One or more files have an unsupported content type'
            )
        }
    }

    /**
     * Manages a ZIP archive by extracting its files, filtering them based on specific criteria,
     * and converting the filtered files into a FileList.
     *
     * @param {File} file - The ZIP file to be managed.
     * @returns {Promise<FileList>} - A promise that resolves to a FileList containing the filtered files.
     * @throws {Error} - Throws an error if no files are found in the archive.
     */
    const manageZipArchive = async (file: File): Promise<FileList> => {
        const archive = await openArchive(file)
        const extractedFiles: Record<string, File | Record<string, File>> =
            await archive.extractFiles()

        const filteredFiles = Object.entries(extractedFiles)
            .filter(
                ([key]) =>
                    !HIDDEN_FILE_PREFIX.some((prefix) => key.startsWith(prefix))
            )
            .flatMap(([, value]) => {
                return value instanceof File ? [value] : Object.values(value)
            })

        if (filteredFiles.length === 0) {
            throw new Error('No files found in the archive')
        }

        return convertArrayToFileList(filteredFiles)
    }

    /**
     * Asynchronously uploads files and processes them accordingly.
     *
     * @param {FileList} files - The list of files to be uploaded.
     * @returns {Promise<void>} A promise that resolves when the files have been successfully uploaded and processed.
     *
     * @throws Will throw an error if there is an issue during the file upload or processing.
     *
     * The function performs the following steps:
     * 1. Calls `controlUploadedFiles` to handle the initial file control.
     * 2. If there is only one file and it is a ZIP archive, it extracts the files from the archive.
     * 3. If there are multiple files or the file is not a ZIP archive, it directly pass to the `onSuccess` callback.
     * 4. Calls the `onSuccess` callback with the validated files.
     * 5. Logs an error and calls the `onFail` callback if an error occurs during the process.
     */
    const uploadFiles = async (files: FileList) => {
        try {
            controlUploadedFiles(files)

            const validatedFiles =
                files.length === 1 && isZipArchive(files[0])
                    ? await manageZipArchive(files[0])
                    : files

            onSuccess(validatedFiles)
        } catch (error) {
            console.error('Error while processing files:', error)
            onFail()
        }
    }

    return { uploadFiles }
}
