import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { recommendPreset } from './recommendPreset'
import * as deviceDetection from './deviceDetection'

type AdapterLimits = {
    maxBufferSize?: number
    maxStorageBufferBindingSize?: number
}

function setDeviceMemory(gb: number | undefined) {
    if (gb === undefined) {
        Reflect.deleteProperty(navigator, 'deviceMemory')
        return
    }
    Object.defineProperty(navigator, 'deviceMemory', {
        configurable: true,
        value: gb,
    })
}

function setGpu(limits: AdapterLimits | undefined | 'absent') {
    if (limits === 'absent') {
        Reflect.deleteProperty(navigator, 'gpu')
        return
    }
    Object.defineProperty(navigator, 'gpu', {
        configurable: true,
        value: {
            requestAdapter: async () =>
                limits === undefined ? null : { limits },
        },
    })
}

beforeEach(() => {
    vi.restoreAllMocks()
    vi.spyOn(deviceDetection, 'isMobileBrowser').mockReturnValue(false)
})

afterEach(() => {
    setDeviceMemory(undefined)
    setGpu('absent')
})

describe('recommendPreset — mobile', () => {
    it('recommends lite on a normal phone', async () => {
        vi.spyOn(deviceDetection, 'isMobileBrowser').mockReturnValue(true)
        setDeviceMemory(4)
        expect(await recommendPreset()).toBe('lite')
    })

    it('recommends minimal on a tiny phone', async () => {
        vi.spyOn(deviceDetection, 'isMobileBrowser').mockReturnValue(true)
        setDeviceMemory(2)
        expect(await recommendPreset()).toBe('minimal')
    })
})

describe('recommendPreset — desktop', () => {
    it('falls back to balanced when no probe signal is available', async () => {
        setDeviceMemory(undefined)
        setGpu('absent')
        expect(await recommendPreset()).toBe('balanced')
    })

    it('recommends rich on an ample device', async () => {
        setDeviceMemory(16)
        setGpu({
            maxBufferSize: 2_000_000_000,
            maxStorageBufferBindingSize: 1_000_000_000,
        })
        expect(await recommendPreset()).toBe('rich')
    })

    it('falls back to balanced when memory is unknown even with an ample GPU', async () => {
        // Firefox/Safari expose no deviceMemory — unknown RAM must not be
        // treated as ample and pushed to Rich.
        setDeviceMemory(undefined)
        setGpu({
            maxBufferSize: 2_000_000_000,
            maxStorageBufferBindingSize: 1_000_000_000,
        })
        expect(await recommendPreset()).toBe('balanced')
    })

    it('recommends minimal on a very constrained desktop', async () => {
        setDeviceMemory(2)
        setGpu({
            maxBufferSize: 2_000_000_000,
            maxStorageBufferBindingSize: 1_000_000_000,
        })
        expect(await recommendPreset()).toBe('minimal')
    })

    it('recommends lite on a low-memory desktop', async () => {
        setDeviceMemory(4)
        setGpu({
            maxBufferSize: 2_000_000_000,
            maxStorageBufferBindingSize: 1_000_000_000,
        })
        expect(await recommendPreset()).toBe('lite')
    })

    it('recommends lite when the GPU max buffer is small', async () => {
        setDeviceMemory(16)
        setGpu({
            maxBufferSize: 256 * 1024 * 1024,
            maxStorageBufferBindingSize: 64 * 1024 * 1024,
        })
        expect(await recommendPreset()).toBe('lite')
    })

    it('recommends balanced on a mid-range device', async () => {
        setDeviceMemory(6)
        setGpu({
            maxBufferSize: 2_000_000_000,
            maxStorageBufferBindingSize: 1_000_000_000,
        })
        expect(await recommendPreset()).toBe('balanced')
    })
})
