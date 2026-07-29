import { useState, useCallback } from 'react'
import { DropzoneWrapper } from './Dropzone/DropzoneWrapper'
import { insertFilesInDatabase } from '../db/queries/insertFilesInDatabase'
import { ProgressBar } from './ProgressBar/ProgressBar'
import type { DuckdbApp as DuckdbAppType, DuckdbInitStage } from '../db/setupDB'
import { DemoButton } from './DemoButton/DemoButton'
import { HowToButton } from './HowToButton/HowToButton'
import { useDemo } from '../hooks/useDemo'
import { useDuckDBInit } from '../hooks/useDuckDBInit'
import { DuckLoader } from './DuckLoader/DuckLoader'
import { Results } from './Results/Results'
import { UploadError } from './UploadError'
import { getUserMessage } from '../utils/uploadErrorMessages'

const INIT_STAGE_LABELS: Record<DuckdbInitStage, string> = {
    select: 'Waking the duck…',
    instantiate: 'Teaching it to swim…',
    connect: 'Smoothing feathers…',
    extensions: 'Almost afloat…',
}

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
    const {
        db,
        stage,
        percent,
        error: initError,
        retry,
    } = useDuckDBInit({
        initialDb,
    })
    const [isDataDropped, setIsDataDropped] = useState(initialIsDataDropped)
    const [isDataReady, setIsDataReady] = useState(initialIsDataReady)
    const [uploadError, setUploadError] = useState<string | null>(null)
    const [loadProgress, setLoadProgress] = useState<{
        stage: string
        percent: number
    } | null>(null)
    const dismissUploadError = useCallback(() => setUploadError(null), [])
    const { isDemoReady, handleDemoButtonClick, demoJsonUrl, demoProgress } =
        useDemo({
            onFail: () =>
                setUploadError(
                    'Could not load the demo data. Please try again.'
                ),
        })

    const activeProgress = loadProgress ?? demoProgress

    async function handleFileUpload(files: FileList | null) {
        if (!files) return
        setIsDataReady(false)
        setIsDataDropped(true)
        setLoadProgress(null)
        try {
            await insertFilesInDatabase(files, (stage, percent) =>
                setLoadProgress({ stage, percent })
            )
            setIsDataReady(true)
        } catch (error) {
            console.error('Failed to upload files:', error)
            setIsDataReady(false)
            setIsDataDropped(false)
            setUploadError(getUserMessage(error))
        } finally {
            setLoadProgress(null)
        }
    }

    if (!db) {
        return (
            <DuckLoader
                stage={INIT_STAGE_LABELS[stage ?? 'select']}
                percent={percent}
                error={initError}
                onRetry={retry}
            />
        )
    }

    return (
        <>
            {(!isDataDropped || isDataReady) && !activeProgress && (
                <div className="flex flex-col md:flex-row gap-4 items-stretch animate-fade-in motion-reduce:animate-none">
                    <div className="flex-grow transition-all duration-300">
                        <DropzoneWrapper
                            handleValidatedFiles={handleFileUpload}
                            onFail={(error) =>
                                setUploadError(getUserMessage(error))
                            }
                        />
                    </div>
                    <div className="flex flex-col justify-center gap-4">
                        <HowToButton
                            label="?"
                            tooltip="How do I get my data?"
                        />
                        {demoJsonUrl && (
                            <DemoButton
                                label="↓"
                                tooltip="Load demo data"
                                handleClick={handleDemoButtonClick}
                            />
                        )}
                    </div>
                </div>
            )}
            {activeProgress && (
                <ProgressBar
                    stage={activeProgress.stage}
                    percent={activeProgress.percent}
                />
            )}
            {(isDataReady || isDemoReady) && <Results />}
            {uploadError && (
                <UploadError
                    message={uploadError}
                    onDismiss={dismissUploadError}
                />
            )}
        </>
    )
}
