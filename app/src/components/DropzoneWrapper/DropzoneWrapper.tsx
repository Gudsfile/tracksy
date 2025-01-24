import { useState } from 'react'

import { insertFilesInDatabase } from '../../db/queries/insertFilesInDatabase'

import { ChartWrapper } from '../ChartWrapper/ChartWrapper'
import { Dropzone } from '../Dropzone/Dropzone'
import { isAllowedFileContentType } from '../../utils/isAllowedFileContentType'
import { isZipArchive } from '../../utils/isZipArchive'
import { convertArrayToFileList } from '../../utils/convertArrayToFileList'
import { openArchive } from '../../utils/openArchive'
import { isSpotifyFilename } from '../../utils/isSpotifyFilename'

export const DropzoneWrapper = () => {
    const [filesReadyToBeRequested, setFilesReadyToBeRequested] =
        useState<boolean>(false)

    const controlUploadedFiles = (files: FileList) => {
        const allowedFiles = Array.from(files).filter(isAllowedFileContentType)

        if (allowedFiles.length !== files.length) {
            throw new Error(
                'One or more files have an unsupported content type'
            )
        }
    }

    const manageUploadedFiles = async (files: FileList) => {
        setFilesReadyToBeRequested(false)
        try {
            controlUploadedFiles(files)

            if (files.length === 1 && isZipArchive(files[0])) {
                // TODO: Move this in a separate component, maybe in Layout
                const archive = await openArchive(files[0])
                let filteredFiles: File[] = []
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
                    filteredFiles = Object.values(extractedFiles).filter(
                        (file): file is File =>
                            file instanceof File
                                ? isAllowedFileContentType(file) &&
                                  isSpotifyFilename(file)
                                : false
                    )
                } else {
                    filteredFiles = Object.values(
                        extractedFiles[filteredFilesKeys[0]]
                    ).filter(
                        (file: File) =>
                            isAllowedFileContentType(file) &&
                            isSpotifyFilename(file)
                    )
                }

                await insertFilesInDatabase(
                    convertArrayToFileList(filteredFiles)
                )
            } else {
                await insertFilesInDatabase(files)
            }

            setFilesReadyToBeRequested(true)
        } catch (error) {
            console.error('Error while processing files:', error)
            setFilesReadyToBeRequested(false)
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
