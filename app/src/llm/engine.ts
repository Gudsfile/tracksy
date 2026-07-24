import {
    CreateMLCEngine,
    prebuiltAppConfig,
    type InitProgressReport,
    type MLCEngineInterface,
} from '@mlc-ai/web-llm'
import { devBus } from '../devToolbar/devBus'
import {
    selectModelId,
    peekLoadedModelId,
    setLoadedModelId,
} from './modelState'

export { isSafariIOS, isMobileBrowser } from './deviceDetection'
// Re-exported for compatibility; the canonical definitions live in the
// web-llm-free modelState module so consumers can import them without pulling
// this heavy engine chunk.
export {
    MODEL_ID,
    MODEL_ID_IOS,
    selectModelId,
    getLoadedModelId,
} from './modelState'

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
    modelId: string = selectModelId(),
    onProgress?: ProgressHandler
): Promise<MLCEngineInterface> {
    if (!isWebGPUAvailable()) {
        throw new Error(
            'WebGPU is not available in this browser. Try Chrome, Edge, or a recent build of Safari.'
        )
    }
    // Reuse the singleton only when it holds the requested model.
    if (enginePromise && peekLoadedModelId() === modelId) return enginePromise

    // A different model was requested: tear the current engine down first, in
    // sequence, so we never hold two engines contending for the GPU at once.
    if (enginePromise) {
        const previous = enginePromise
        enginePromise = null
        setLoadedModelId(null)
        try {
            await (await previous).unload()
        } catch {
            // Already failed/unloaded — nothing to clean up.
        }
    }

    setLoadedModelId(modelId)
    enginePromise = CreateMLCEngine(modelId, {
        initProgressCallback: (report) => {
            onProgress?.(report)
            devBus.emit('webllm:load', {
                model: modelId,
                progress: report.progress,
                text: report.text,
            })
        },
    }).catch((e) => {
        // Reset so a future attempt can retry
        enginePromise = null
        setLoadedModelId(null)
        throw e
    })

    return enginePromise
}

export type ModelInfo = {
    id: string
    vramMB?: number
    lowResource: boolean
}

/**
 * The instruct/coder models from WebLLM's prebuilt catalog, for the Advanced
 * model picker. Lives here (lazy-loaded) so `prebuiltAppConfig` never reaches
 * the main bundle.
 */
export function listModels(): ModelInfo[] {
    return prebuiltAppConfig.model_list
        .filter((m) => /instruct|coder/i.test(m.model_id))
        .map((m) => ({
            id: m.model_id,
            vramMB: m.vram_required_MB,
            lowResource: m.low_resource_required ?? false,
        }))
}
