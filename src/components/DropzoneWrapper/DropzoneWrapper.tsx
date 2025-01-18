import { useState } from 'react'

import { ChartWrapper } from '../ChartWrapper/ChartWrapper'
import { Dropzone } from '../Dropzone/Dropzone'
import { useFileUpload } from './useFileUpload'

export const DropzoneWrapper = () => {
    const [filesReadyToBeRequested, setFilesReadyToBeRequested] =
        useState<boolean>(false)

    const { uploadFiles } = useFileUpload({
        onSuccess: () => setFilesReadyToBeRequested(true),
        onFail: () => {
            console.error('Upload failed')
            setFilesReadyToBeRequested(false)
        },
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
        <>
            <Dropzone
                handleDrop={handleDrop}
                handleDragOver={handleDragOver}
                handleFileUpload={handleFileUpload}
                contentTypeAccepted=".zip,application/json"
            />
            {filesReadyToBeRequested && <ChartWrapper />}
        </>
    )
}
