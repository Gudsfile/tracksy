import { isMobileBrowser } from './deviceDetection'
import { MODEL_LARGE, MODEL_SMALL } from './assistantConfig'

// Lightweight, web-llm-free model state. The `ask*` helpers only need the
// loaded model id for telemetry, so keeping it here (rather than in engine.ts)
// means importing it never statically pulls the ~5.7 MB web-llm `engine` chunk
// into the eager Chat-tab bundle. `engine.ts` writes this state during load.

// Legacy UA-split fallback ids, only used when no explicit model is supplied.
// assistantConfig is the single source of truth; it shares this module's
// `assistant-config` chunk, so importing the ids adds no web-llm bleed.
export const MODEL_ID = MODEL_LARGE
export const MODEL_ID_IOS = MODEL_SMALL

let loadedModelId: string | null = null

/** Fallback model when no explicit choice is supplied (legacy UA split). */
export function selectModelId(): string {
    return isMobileBrowser() ? MODEL_ID_IOS : MODEL_ID
}

/** The model the engine is currently loaded with, for accurate telemetry. */
export function getLoadedModelId(): string {
    return loadedModelId ?? selectModelId()
}

/** Raw loaded id (nullable), for the engine's singleton reuse check. */
export function peekLoadedModelId(): string | null {
    return loadedModelId
}

/** Set by the engine as it loads/tears down a model. */
export function setLoadedModelId(id: string | null): void {
    loadedModelId = id
}
