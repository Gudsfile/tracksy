import {
    CreateMLCEngine,
    type InitProgressReport,
    type MLCEngineInterface,
} from '@mlc-ai/web-llm'
import { isMobileBrowser } from './deviceDetection'
import { devBus } from '../devToolbar/devBus'

export { isSafariIOS, isMobileBrowser } from './deviceDetection'

export const MODEL_ID = 'Qwen2.5-Coder-1.5B-Instruct-q4f16_1-MLC'
export const MODEL_ID_IOS = 'Qwen2.5-Coder-0.5B-Instruct-q4f16_1-MLC'

let enginePromise: Promise<MLCEngineInterface> | null = null

export function isWebGPUAvailable(): boolean {
    return (
        typeof navigator !== 'undefined' &&
        'gpu' in navigator &&
        navigator.gpu !== undefined
    )
}

export function selectModelId(): string {
    return isMobileBrowser() ? MODEL_ID_IOS : MODEL_ID
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

    enginePromise = CreateMLCEngine(selectModelId(), {
        initProgressCallback: (report) => {
            onProgress?.(report)
            devBus.emit('webllm:load', {
                model: selectModelId(),
                progress: report.progress,
                text: report.text,
            })
        },
    }).catch((e) => {
        // Reset so a future attempt can retry
        enginePromise = null
        throw e
    })

    return enginePromise
}
