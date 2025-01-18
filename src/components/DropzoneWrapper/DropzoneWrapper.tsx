import { navigate } from 'astro:transitions/client'

import { Dropzone } from '../Dropzone/Dropzone'
import { useFileUpload } from './useFileUpload'

export const DropzoneWrapper = () => {
    const { uploadFiles } = useFileUpload({
        onSuccess: () => navigate('/results'),
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

    return (
        <Dropzone
            handleDrop={handleDrop}
            handleDragOver={handleDragOver}
            handleFileUpload={handleFileUpload}
            contentTypeAccepted=".zip,application/json"
        />
    )
}
