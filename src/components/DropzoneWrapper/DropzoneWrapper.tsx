import { useState } from 'react'
import { queryFilesInDatabase } from '../../db/queries/queryFilesInDatabase.ts'
import { ChartWrapper } from '../ChartWrapper/ChartWrapper'

import { Dropzone } from '../Dropzone/Dropzone.tsx'

export const DropzoneWrapper = () => {
    const [filesReadyToBeRequested, setFilesReadyToBeRequested] =
        useState<boolean>(false)

    const manageUploadedFiles = async (files: FileList) => {
        const result = await queryFilesInDatabase(files)
        if (result !== undefined) {
            setFilesReadyToBeRequested(true)
        }
    }

    const handleFileUpload = async (
        event: React.ChangeEvent<HTMLInputElement>
    ) => {
        const files = event.target.files

        if (files === null) return undefined

        console.log('Uploaded files:', Array.from(files))
        await manageUploadedFiles(files)
    }

    const handleDrop = async (event: React.DragEvent<HTMLDivElement>) => {
        event.preventDefault()

        const files = event.dataTransfer.files

        console.log('Dragged in files:', Array.from(files))
        await manageUploadedFiles(files)
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
            />
            {filesReadyToBeRequested && <ChartWrapper />}
        </>
    )
}
