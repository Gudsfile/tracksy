import { isMobileBrowser } from './deviceDetection'
import type { AssistantPreset } from './assistantConfig'

/**
 * Picks the preset to recommend for the current device.
 *
 * Probes the real WebGPU adapter limits and `navigator.deviceMemory` so a
 * low-RAM desktop (which the old UA-only split couldn't detect) is nudged to a
 * lighter preset instead of OOM-ing on the 1.5B model. When those signals are
 * unavailable (Firefox / Safari expose no `deviceMemory`), it falls back to the
 * UA binary with a conservative default (desktop → Balanced, mobile → Lite).
 *
 * Assumes WebGPU support has already been confirmed; callers show the
 * `unsupported` state when it is missing.
 */

type NavigatorMemory = Navigator & { deviceMemory?: number }

type AdapterLimits = {
    maxBufferSize?: number
    maxStorageBufferBindingSize?: number
}
type GPUAdapterLike = { limits?: AdapterLimits }
type NavigatorGPU = Navigator & {
    gpu?: { requestAdapter(): Promise<GPUAdapterLike | null> }
}

// Thresholds. Kept deliberately loose — the goal is to steer away from OOM,
// not to squeeze the largest model onto every device.
const AMPLE_MEMORY_GB = 8
const LOW_MEMORY_GB = 4
const VERY_LOW_MEMORY_GB = 2 // barely enough for even the small model → table-only
const AMPLE_BUFFER_BYTES = 1_000_000_000 // ~1 GB max buffer → 1.5B is safe
const LOW_BUFFER_BYTES = 512 * 1024 * 1024 // <512 MB → prefer the small model
const VERY_LOW_BUFFER_BYTES = 128 * 1024 * 1024 // <128 MB → table-only

function deviceMemoryGb(): number | undefined {
    if (typeof navigator === 'undefined') return undefined
    const mem = (navigator as NavigatorMemory).deviceMemory
    return typeof mem === 'number' ? mem : undefined
}

async function adapterLimits(): Promise<AdapterLimits | undefined> {
    if (typeof navigator === 'undefined') return undefined
    const gpu = (navigator as NavigatorGPU).gpu
    if (!gpu) return undefined
    try {
        const adapter = await gpu.requestAdapter()
        return adapter?.limits
    } catch {
        return undefined
    }
}

export async function recommendPreset(): Promise<AssistantPreset> {
    const mem = deviceMemoryGb()

    if (isMobileBrowser()) {
        // Very small phones can't even hold the 0.5B comfortably.
        return mem !== undefined && mem <= 2 ? 'minimal' : 'lite'
    }

    const limits = await adapterLimits()
    const maxBuffer = limits?.maxBufferSize
    const maxStorage = limits?.maxStorageBufferBindingSize

    // No usable probe signal at all → conservative desktop default.
    if (mem === undefined && limits === undefined) return 'balanced'

    // Extremely constrained desktop: even the small model is risky → table-only.
    const veryLowMemory = mem !== undefined && mem <= VERY_LOW_MEMORY_GB
    const veryLowBuffer =
        maxBuffer !== undefined && maxBuffer < VERY_LOW_BUFFER_BYTES
    if (veryLowMemory || veryLowBuffer) return 'minimal'

    const lowMemory = mem !== undefined && mem <= LOW_MEMORY_GB
    const lowBuffer = maxBuffer !== undefined && maxBuffer < LOW_BUFFER_BYTES
    if (lowMemory || lowBuffer) return 'lite'

    // Require a positive confirmation of ample memory — unknown RAM
    // (Firefox/Safari expose no deviceMemory) must not be treated as ample, or
    // a device with a big GPU buffer but tiny RAM would be pushed to Rich.
    const ampleMemory = mem !== undefined && mem >= AMPLE_MEMORY_GB
    const ampleBuffer =
        (maxBuffer === undefined || maxBuffer >= AMPLE_BUFFER_BYTES) &&
        (maxStorage === undefined || maxStorage >= AMPLE_BUFFER_BYTES / 4)
    if (ampleMemory && ampleBuffer) return 'rich'

    return 'balanced'
}
