import { Dropzone } from './Dropzone'
import { isAllowedFileContentType } from '../../utils/isAllowedFileContentType'
import { isZipArchive } from '../../utils/isZipArchive'
import { openArchive } from '../../utils/openArchive'
import { isSpotifyFilename } from '../../utils/isSpotifyFilename'

interface Props {
    setFiles: (files: FileList | null) => void
}

export function DropzoneWrapper({ setFiles }: Props) {
    const controlUploadedFiles = (files: FileList) => {
        const allowedFiles = Array.from(files).filter(isAllowedFileContentType)

        if (allowedFiles.length !== files.length) {
            throw new Error(
                'One or more files have an unsupported content type'
            )
        }
    }

    const manageUploadedFiles = async (files: FileList) => {
        try {
            controlUploadedFiles(files)

            if (files.length === 1 && isZipArchive(files[0])) {
                const archive = await openArchive(files[0])
                let filteredArray: File[] = []
                const extractedFiles: Record<
                    string,
                    File | Record<string, File>
                > = await archive.extractFiles()

                const filteredFilesKeys = Object.keys(extractedFiles).filter(
                    (key) => !['__MACOSX'].includes(key)
                )

                if (filteredFilesKeys.length === 0)
                    throw new Error('No files found in the archive')

                if (
                    Object.values(extractedFiles).some(
                        (file: File | Record<string, File>) =>
                            typeof file === 'object' && 'type' in file
                    )
                ) {
                    filteredArray = Object.values(extractedFiles).filter(
                        (file): file is File =>
                            file instanceof File
                                ? isAllowedFileContentType(file) &&
                                  isSpotifyFilename(file)
                                : false
                    )
                } else {
                    filteredArray = Object.values(
                        extractedFiles[filteredFilesKeys[0]]
                    ).filter(
                        (file: File) =>
                            isAllowedFileContentType(file) &&
                            isSpotifyFilename(file)
                    )
                }
                console.log(filteredArray)
                const dataTransfer = new DataTransfer()
                filteredArray.forEach((file) => dataTransfer.items.add(file))
                setFiles(dataTransfer.files)
            }
            setFiles(files)
        } catch (error) {
            console.error('Error while processing files:', error)
        }
    }

    const handleFileUpload = async (
        event: React.ChangeEvent<HTMLInputElement>
    ) => {
        const files = event.target.files

        if (files === null) return undefined

        console.debug('Uploaded files:', Array.from(files))
        manageUploadedFiles(files)
    }

    const handleDrop = async (event: React.DragEvent<HTMLDivElement>) => {
        event.preventDefault()

        const files = event.dataTransfer.files

        console.debug('Dragged in files:', Array.from(files))
        manageUploadedFiles(files)
    }

    const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
        event.preventDefault()
    }

    return (
        <Dropzone
            handleDrop={handleDrop}
            handleDragOver={handleDragOver}
            handleFileUpload={handleFileUpload}
            contentTypeAccepted=".zip,application/json"
        />
    )
}
