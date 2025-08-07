import { useState, useEffect } from 'react'
import { getDB } from '../db/getDB'
import { DropzoneWrapper } from './Dropzone/DropzoneWrapper'
import { insertFilesInDatabase } from '../db/queries/insertFilesInDatabase'
import { Charts } from './Charts/Charts'
import { Spinner } from './Spinner/Spinner'
import type { DuckdbApp as DuckdbAppType } from '../db/setupDB'
import { DemoButton } from './DemoButton/DemoButton'
import { useDemo } from '../hooks/useDemo'

interface TracksyWrapperProps {
    initialDb?: DuckdbAppType | null
    initialIsDataDropped?: boolean
    initialIsDataReady?: boolean
}

export function TracksyWrapper({
    initialDb = null,
    initialIsDataDropped = false,
    initialIsDataReady = false,
}: TracksyWrapperProps) {
    const [db, setDb] = useState<DuckdbAppType | null>(initialDb)
    const [isDataDropped, setIsDataDropped] = useState(initialIsDataDropped)
    const [isDataReady, setIsDataReady] = useState(initialIsDataReady)
    const { isDemoReady, handleDemoButtonClick, demoJsonUrl } = useDemo()

    useEffect(() => {
        const initDB = async () => {
            const dbInstance = await getDB()
            setDb(dbInstance)
        }
        initDB()
    }, [])

    async function handleFileUpload(files: FileList | null) {
        if (!files) return
        setIsDataReady(false)
        setIsDataDropped(true)
        await insertFilesInDatabase(files)
        setIsDataReady(true)
    }

    return (
        <>
            {db && (!isDataDropped || isDataReady) && (
                <DropzoneWrapper handleValidatedFiles={handleFileUpload} />
            )}
            {db &&
                !isDataDropped &&
                !isDataReady &&
                !isDemoReady &&
                demoJsonUrl && (
                    <DemoButton
                        label="Charger les données de démo"
                        handleClick={handleDemoButtonClick}
                    />
                )}
            {db && isDataDropped && !isDataReady && <Spinner />}
            {db && (isDataReady || isDemoReady) && <Charts />}
        </>
    )
}
