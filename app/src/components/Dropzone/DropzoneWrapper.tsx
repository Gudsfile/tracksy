import { STREAM_PROVIDERS_CONTENT_TYPES } from '../../streamProvider'
import { zipContentFile } from '../../utils/isZipArchive'
import { Dropzone } from './Dropzone'
import { useFileUpload } from './useFileUpload'

interface Props {
    handleValidatedFiles: (files: FileList | null) => void
}

export function DropzoneWrapper({ handleValidatedFiles }: Props) {
    const { uploadFiles } = useFileUpload({
        onSuccess: (validatedFiles) => handleValidatedFiles(validatedFiles),
        onFail: () => console.error('Upload failed'),
    })

    const handleFileUpload = async (
        event: React.ChangeEvent<HTMLInputElement>
    ) => {
        const files = event.target.files

        if (files === null) return undefined

        console.debug('Uploaded files:', Array.from(files))
        await uploadFiles(files)
    }

    const handleDrop = async (event: React.DragEvent<HTMLDivElement>) => {
        event.preventDefault()

        const files = event.dataTransfer.files

        console.debug('Dragged in files:', Array.from(files))
        await uploadFiles(files)
    }

    const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
        event.preventDefault()
    }

    const contentTypeAccepted =
        STREAM_PROVIDERS_CONTENT_TYPES.join(',') + zipContentFile

    return (
        <Dropzone
            handleDrop={handleDrop}
            handleDragOver={handleDragOver}
            handleFileUpload={handleFileUpload}
            contentTypeAccepted={contentTypeAccepted}
        />
    )
}
