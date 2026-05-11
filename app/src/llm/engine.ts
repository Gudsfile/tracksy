import {
    CreateMLCEngine,
    type InitProgressReport,
    type MLCEngineInterface,
} from '@mlc-ai/web-llm'

export const MODEL_ID = 'Qwen2.5-Coder-1.5B-Instruct-q4f16_1-MLC'

let enginePromise: Promise<MLCEngineInterface> | null = null

export function isWebGPUAvailable(): boolean {
    return (
        typeof navigator !== 'undefined' &&
        'gpu' in navigator &&
        navigator.gpu !== undefined
    )
}

export type ProgressHandler = (report: InitProgressReport) => void

export async function getEngine(
    onProgress?: ProgressHandler
): Promise<MLCEngineInterface> {
    if (!isWebGPUAvailable()) {
        throw new Error(
            'WebGPU is not available in this browser. Try Chrome, Edge, or a recent build of Safari.'
        )
    }
    if (enginePromise) return enginePromise

    enginePromise = CreateMLCEngine(MODEL_ID, {
        initProgressCallback: (report) => onProgress?.(report),
    }).catch((e) => {
        // Reset so a future attempt can retry
        enginePromise = null
        throw e
    })

    return enginePromise
}
