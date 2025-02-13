import { useState, useEffect } from 'react'
import { getDB } from '../db/getDB'
import { DropzoneWrapper } from './Dropzone/DropzoneWrapper'
import { insertFilesInDatabase } from '../db/queries/insertFilesInDatabase'
import { Charts } from './Charts/Charts'
import { Spinner } from './Spinner/Spinner'
import type { DuckdbApp as DuckdbAppType } from '../db/setupDB'

export function TracksyWrapper() {
    const [db, setDb] = useState<DuckdbAppType | null>(null)
    const [isDataDropped, setIsDataDropped] = useState(false)
    const [isDataReady, setIsDataReady] = useState(false)

    useEffect(() => {
        const initDB = async () => {
            const dbInstance = await getDB()
            setDb(dbInstance)
        }
        initDB()
    }, [])

    async function handleFileUpload(files: FileList | null) {
        if (!files) return
        console.log('New dropped files:', files)
        setIsDataReady(false)
        setIsDataDropped(true)
        await insertFilesInDatabase(files)
        setIsDataReady(true)
        console.log('New uploaded files:', files)
    }

    return (
        <>
            {db && !(isDataDropped && !isDataReady) && (
                <DropzoneWrapper setFiles={handleFileUpload} />
            )}
            {db && isDataDropped && !isDataReady && <Spinner />}
            {db && isDataReady && <Charts />}
        </>
    )
}
