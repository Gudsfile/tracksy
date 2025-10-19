import { useState, useEffect } from 'react'
import { getDB } from '../db/getDB'
import { DropzoneWrapper } from './Dropzone/DropzoneWrapper'
import { insertFilesInDatabase } from '../db/queries/insertFilesInDatabase'
import { Spinner } from './Spinner/Spinner'
import type { DuckdbApp as DuckdbAppType } from '../db/setupDB'
import { DemoButton } from './DemoButton/DemoButton'
import { useDemo } from '../hooks/useDemo'
import { Results } from './Results/Results'

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

    if (!db) {
        return (
            <>
                <p className="dark:text-white">
                    Initializing the database engine (DuckDB-WASM)...
                </p>
            </>
        )
    }

    return (
        <>
            {(!isDataDropped || isDataReady) && (
                <DropzoneWrapper handleValidatedFiles={handleFileUpload} />
            )}
            {!isDataDropped && !isDataReady && !isDemoReady && demoJsonUrl && (
                <DemoButton
                    label="Load demo data"
                    handleClick={handleDemoButtonClick}
                />
            )}
            {isDataDropped && !isDataReady && <Spinner />}
            {(isDataReady || isDemoReady) && <Results />}
        </>
    )
}
